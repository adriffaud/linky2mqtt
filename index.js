const fs = require('fs');
const util = require('util');

const { format, sub } = require('date-fns');
const linky = require('linky');
const mqtt = require('mqtt');

const auth = require('./auth.json');

const asyncWrite = util.promisify(fs.writeFile);

console.log(`Starting...`);
console.log(auth);

const now = new Date();
const today = format(now, 'yyyy-MM-dd');
const yesterday = format(sub(now, { days: 1 }), 'yyyy-MM-dd');

const session = new linky.Session({
  accessToken: auth.access_token,
  refreshToken: auth.refresh_token,
  usagePointId: auth.usage_point_id,
  onTokenRefresh: async (accessToken, refreshToken) => {
    console.log(`Renewed tokens : ${{ accessToken, refreshToken }}`);
    const newAuth = { accessToken, refreshToken, usage_point_id: auth.usage_point_id };
    await asyncWrite('./auth.json', newAuth);
  },
});

(async () => {
  try {
    console.log({ now, today, yesterday });
    const res = await session.getDailyConsumption(yesterday, today);
    console.log(res);
  } catch (e) {
    console.error('An error occurred while retrieving daily consumption');
    console.log(e);
  }
})();
