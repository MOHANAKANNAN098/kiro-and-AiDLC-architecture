'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand
} = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME  = 'she-shield-contacts';
const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

function respond(statusCode, body) {
  return { statusCode, headers: CORS, body: JSON.stringify(body) };
}

async function getContacts(event) {
  const userId = event.queryStringParameters && event.queryStringParameters.userId;
  if (!userId) return respond(400, { error: 'MISSING_USER_ID' });

  const result = await ddb.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId }
  }));
  return respond(200, { contacts: result.Items || [] });
}

async function createContact(event) {
  const body = JSON.parse(event.body || '{}');
  const { userId, name, phone, email } = body;

  if (!userId)                        return respond(400, { error: 'MISSING_USER_ID' });
  if (!phone || !PHONE_REGEX.test(phone)) return respond(400, { error: 'INVALID_PHONE' });
  if (!email || !EMAIL_REGEX.test(email)) return respond(400, { error: 'INVALID_EMAIL' });

  const existing = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: { userId, phone } }));
  if (existing.Item) return respond(400, { error: 'DUPLICATE_PHONE' });

  await ddb.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: { userId, phone, name: name || '', email, createdAt: new Date().toISOString() }
  }));
  return respond(201, { created: true });
}

async function updateContact(event) {
  const body = JSON.parse(event.body || '{}');
  const { userId, name, email } = body;
  const phone = decodeURIComponent((event.pathParameters && event.pathParameters.phone) || '');

  if (!userId) return respond(400, { error: 'MISSING_USER_ID' });
  if (!phone)  return respond(400, { error: 'INVALID_PHONE' });

  const exprs = []; const names = {}; const vals = {};
  if (name  !== undefined) { exprs.push('#n = :name'); names['#n'] = 'name'; vals[':name'] = name; }
  if (email !== undefined) {
    if (!EMAIL_REGEX.test(email)) return respond(400, { error: 'INVALID_EMAIL' });
    exprs.push('email = :email'); vals[':email'] = email;
  }
  if (!exprs.length) return respond(400, { error: 'NO_FIELDS_TO_UPDATE' });

  await ddb.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { userId, phone },
    UpdateExpression: 'SET ' + exprs.join(', '),
    ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
    ExpressionAttributeValues: vals
  }));
  return respond(200, { updated: true });
}

async function deleteContact(event) {
  const body = JSON.parse(event.body || '{}');
  const userId = body.userId;
  const phone  = decodeURIComponent((event.pathParameters && event.pathParameters.phone) || '');

  if (!userId) return respond(400, { error: 'MISSING_USER_ID' });
  if (!phone)  return respond(400, { error: 'INVALID_PHONE' });

  await ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { userId, phone } }));
  return respond(200, { deleted: true });
}

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;
    const path   = event.path || '';

    if (method === 'GET'    && path === '/contacts')                    return await getContacts(event);
    if (method === 'POST'   && path === '/contacts')                    return await createContact(event);
    if (method === 'PUT'    && /^\/contacts\/[^/]+$/.test(path)) {
      if (!event.pathParameters) event = { ...event, pathParameters: { phone: path.replace('/contacts/', '') } };
      return await updateContact(event);
    }
    if (method === 'DELETE' && /^\/contacts\/[^/]+$/.test(path)) {
      if (!event.pathParameters) event = { ...event, pathParameters: { phone: path.replace('/contacts/', '') } };
      return await deleteContact(event);
    }
    return respond(404, { error: 'NOT_FOUND' });
  } catch (err) {
    console.error('[she-shield-ai] contacts-handler:', err);
    return respond(err.statusCode || 500, { error: err.message || 'INTERNAL_ERROR' });
  }
};
