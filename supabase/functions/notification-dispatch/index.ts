import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type NotificationQueueRow = {
  id: string;
  user_id: string;
  delivery_channel: 'in_app' | 'expo_push';
  title: string;
  body: string;
  payload: Record<string, unknown> | null;
};

type ProfileRow = {
  id: string;
  expo_push_token: string | null;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

async function sendExpoPushNotification(
  expoPushToken: string,
  row: NotificationQueueRow,
  expoAccessToken?: string
) {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
      ...(expoAccessToken ? { Authorization: `Bearer ${expoAccessToken}` } : {}),
    },
    body: JSON.stringify({
      to: expoPushToken,
      title: row.title,
      body: row.body,
      data: row.payload ?? {},
      sound: 'default',
      channelId: 'default',
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Expo push send failed: ${response.status} ${message}`);
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const expoAccessToken = Deno.env.get('EXPO_ACCESS_TOKEN');
  const batchSize = Number(Deno.env.get('NOTIFICATION_BATCH_SIZE') ?? '50');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return jsonResponse(
      { error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY secret.' },
      500
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const startedAt = new Date().toISOString();

  const runInsert = await supabase
    .from('notification_dispatch_runs')
    .insert({
      started_at: startedAt,
      status: 'running',
      processed_count: 0,
      delivered_count: 0,
      failed_count: 0,
    })
    .select('id')
    .single();

  const runId = runInsert.data?.id ?? null;

  try {
    const { data: queuedRows, error: queueError } = await supabase
      .from('notification_queue')
      .select('id, user_id, delivery_channel, title, body, payload')
      .eq('delivery_status', 'queued')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(batchSize);

    if (queueError) {
      throw queueError;
    }

    const notifications = (queuedRows ?? []) as NotificationQueueRow[];

    if (notifications.length === 0) {
      if (runId) {
        await supabase
          .from('notification_dispatch_runs')
          .update({
            status: 'completed',
            processed_count: 0,
            delivered_count: 0,
            failed_count: 0,
            finished_at: new Date().toISOString(),
          })
          .eq('id', runId);
      }

      return jsonResponse({
        status: 'ok',
        processed: 0,
        delivered: 0,
        failed: 0,
      });
    }

    const uniqueUserIds = [...new Set(notifications.map((row) => row.user_id))];
    const { data: profileRows, error: profileError } = await supabase
      .from('profiles')
      .select('id, expo_push_token')
      .in('id', uniqueUserIds);

    if (profileError) {
      throw profileError;
    }

    const pushTokenByUserId = new Map(
      ((profileRows ?? []) as ProfileRow[]).map((profile) => [profile.id, profile.expo_push_token])
    );

    let deliveredCount = 0;
    let failedCount = 0;

    for (const row of notifications) {
      try {
        if (row.delivery_channel === 'expo_push') {
          const expoPushToken = pushTokenByUserId.get(row.user_id);

          if (!expoPushToken) {
            throw new Error('Missing expo_push_token for user.');
          }

          await sendExpoPushNotification(expoPushToken, row, expoAccessToken);
        }

        const { error: updateError } = await supabase
          .from('notification_queue')
          .update({
            delivery_status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', row.id);

        if (updateError) {
          throw updateError;
        }

        deliveredCount += 1;
      } catch (error) {
        failedCount += 1;

        await supabase
          .from('notification_queue')
          .update({
            delivery_status: 'failed',
          })
          .eq('id', row.id);

        console.error('[notification-dispatch] Failed notification', row.id, error);
      }
    }

    if (runId) {
      await supabase
        .from('notification_dispatch_runs')
        .update({
          status: failedCount > 0 ? 'completed_with_failures' : 'completed',
          processed_count: notifications.length,
          delivered_count: deliveredCount,
          failed_count: failedCount,
          finished_at: new Date().toISOString(),
        })
        .eq('id', runId);
    }

    return jsonResponse({
      status: 'ok',
      processed: notifications.length,
      delivered: deliveredCount,
      failed: failedCount,
    });
  } catch (error) {
    console.error('[notification-dispatch] Run failed', error);

    if (runId) {
      await supabase
        .from('notification_dispatch_runs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
        })
        .eq('id', runId);
    }

    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Notification dispatch failed.',
      },
      500
    );
  }
});
