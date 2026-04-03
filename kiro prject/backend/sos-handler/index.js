'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const TABLE_NAME   = 'she-shield-contacts';
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sns = new SNSClient({});

const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

function respond(statusCode, body) {
  return { statusCode, headers: CORS, body: JSON.stringify(body) };
}

function buildEmailBody(userName, lat, lng, timestamp, locationStale) {
  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
  const staleWarning = locationStale
    ? '<p style="color:#cc0000;font-weight:bold;">⚠️ Warning: Location data may be outdated.</p>'
    : '';
  return `<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <h1 style="color:#E91E8C;">🚨 SOS Emergency Alert</h1>
  <p><strong>${userName}</strong> has triggered an emergency SOS alert.</p>
  ${staleWarning}
  <table style="border-collapse:collapse;width:100%;">
    <tr><td style="padding:8px;font-weight:bold;">Time:</td><td style="padding:8px;">${timestamp}</td></tr>
    <tr><td style="padding:8px;font-weight:bold;">Location:</td><td style="padding:8px;"><a href="${mapsUrl}">${lat}, ${lng}</a></td></tr>
  </table>
  <p style="margin-top:20px;">
    <a href="${mapsUrl}" style="background:#E91E8C;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">View on Google Maps</a>
  </p>
  <p style="color:#666;font-size:12px;margin-top:30px;">Sent by She Shield AI. If this was a mistake, contact ${userName} directly.</p>
</body></html>`;
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, userName, lat, lng, accuracy, timestamp, locationStale } = body;

    const queryResult = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId }
    }));
    const contacts = queryResult.Items || [];

    const snsMessage = {
      default: `🚨 SOS from ${userName} at ${timestamp}`,
      sms:     `SOS ALERT: ${userName} needs help! Location: https://maps.google.com/?q=${lat},${lng} Time: ${timestamp}`,
      email:   buildEmailBody(userName, lat, lng, timestamp, locationStale)
    };

    try {
      await sns.send(new PublishCommand({
        TopicArn: SNS_TOPIC_ARN,
        Message: JSON.stringify(snsMessage),
        MessageStructure: 'json',
        Subject: `🚨 SOS Alert from ${userName}`
      }));
    } catch (snsErr) {
      console.error('[she-shield-ai] SNS publish failed:', snsErr);
      return respond(503, { dispatched: false, error: 'NOTIFICATION_FAILED' });
    }

    return respond(200, { dispatched: true, contactsNotified: contacts.length });
  } catch (err) {
    console.error('[she-shield-ai] sos-handler:', err);
    return respond(err.statusCode || 500, { error: err.message || 'INTERNAL_ERROR' });
  }
};
