var test = require('tape');
var nock = require('nock');
var roster = require('../lib/command/roster.js');
var callRoster = roster.fn.bind({
  client: {
    reply: (message, text) => Promise.resolve(`@${message.author}, ${text}`),
  },
});

test('command.roster', t => {
  t.deepEqual(roster.fn.options, {
    argCount: 1,
    argSplit: ' ',
    description: 'List a clan roster. Defaults to your own clan if no tag specified.',
    passRecord: true,
    signatures: ['@BOTNAME roster [tag]'],
  }, 'verify options');

  t.equal(roster.name, 'roster', 'verify Commands method name');

  t.test('no argument, clan_id *not* in database', st => {
    var accountInfo = nock('https://api.wotblitz.com')
      .post('/wotb/clans/accountinfo/')
      .query({
        account_id: '10996722',
        extra: null,
        fields: 'clan_id',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {
          count: 1,
        },
        data: {
          '10996722': {
            clan_id: 82,
          },
        },
      });

    var clanInfo = nock('https://api.wotblitz.com')
      .post('/wotb/clans/info/')
      .query({
        clan_id: 82,
        extra: 'members',
        fields: 'name,members',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {
          count: 1,
        },
        data: {
          '82': {
            name: 'Love our Tanks',
            members: {
              '10996722': {
                role: 'private',
                joined_at: 1456548354,
                account_id: 10996722,
                account_name: 'maker84',
              },
              '10990010': {
                role: 'private',
                joined_at: 1456548283,
                account_id: 10990010,
                account_name: 'baker12',
              },
              '10990011': {
                role: 'executive_officer',
                joined_at: 1456548623,
                account_id: 10990011,
                account_name: 'joker47',
              },
              '10990012': {
                role: 'commander',
                joined_at: 1456548903,
                account_id: 10990012,
                account_name: 'mocker2',
              },
            },
          },
        },
      });

    callRoster({author: 'maker84 [TANKS]'}, {account_id: 10996722}).then(result => {
      st.deepEqual(result, {
        sentMsg: '@maker84 [TANKS], The roster for `Love our Tanks` is: **mocker2**, *joker47*, baker12, maker84',
        updateFields: {
          clan_id: 82,
        },
      }, 'replies and indicates a record update');

      st.ok(accountInfo.isDone() && clanInfo.isDone(), 'made two wotblitz api calls');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('no argument, clan_id in database', st => {
    var clanInfo = nock('https://api.wotblitz.com')
      .post('/wotb/clans/info/')
      .query({
        clan_id: 3,
        extra: 'members',
        fields: 'name,members',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {
          count: 1,
        },
        data: {
          '3': {
            name: 'Big Bang Theory',
            members: {
              '10996688': {
                role: 'executive_officer',
                joined_at: 1456547632,
                account_id: 10996688,
                account_name: 'player_10996688',
              },
              '10996723': {
                role: 'commander',
                joined_at: 1456548312,
                account_id: 10996723,
                account_name: 'magie~67',
              },
            },
          },
        },
      });

    callRoster({author: 'magie~67 [BANG]'}, {clan_id: 3, account_id: 10996723}).then(result => {
      st.deepEqual(result, {
        sentMsg: '@magie~67 [BANG], The roster for `Big Bang Theory` is: **magie\\~67**, *player\\_10996688*',
        updateFields: {
          clan_id: 3,
        },
      }, 'replies and indicates a record update');

      st.ok(clanInfo.isDone(), 'made wotblitz api call');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('valid tag argument', st => {
    var clanList = nock('https://api.wotblitz.com')
      .post('/wotb/clans/list/')
      .query({
        search: 'DNFX',
        limit: null,
        page_no: 1,
        fields: 'clan_id,tag',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {
          count: 3,
        },
        data: [
          {clan_id: 372, tag: 'DENFX'},
          {clan_id: 725, tag: 'DNFX'},
          {clan_id: 867, tag: 'DNFX2'},
        ],
      });

    var clanInfo = nock('https://api.wotblitz.com')
      .post('/wotb/clans/info/')
      .query({
        clan_id: 725,
        extra: 'members',
        fields: 'name,members',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {
          count: 1,
        },
        data: {
          '725': {
            name: 'Den Fox 1',
            members: {
              '10998320': {
                role: 'private',
                joined_at: 1456546992,
                account_id: 10998320,
                account_name: 'Private_1',
              },
              '10998321': {
                role: 'commander',
                joined_at: 1456539982,
                account_id: 1099821,
                account_name: 'Commander',
              },
              '10998322': {
                role: 'executive_officer',
                joined_at: 1456559374,
                account_id: 10998322,
                account_name: 'Officer*1',
              },
              '10998323': {
                role: 'private',
                joined_at: 1456556928,
                account_id: 10998323,
                account_name: 'Private_4',
              },
              '10998324': {
                role: 'private',
                joined_at: 1456556782,
                account_id: 10998324,
                account_name: 'Private_3',
              },
              '10998325': {
                role: 'executive_officer',
                joined_at: 1456559483,
                account_id: 10998425,
                account_name: 'Officer*2',
              },
              '10998326': {
                role: 'private',
                joined_at: 1456547823,
                account_id: 10998326,
                account_name: 'Private_2',
              },
            },
          },
        },
      });

    callRoster({author: 'greg14 [DNFX2]'}, {account_id: 10996724}, 'DNFX').then(result => {
      st.deepEqual(result, {
        sentMsg: [
          '@greg14 [DNFX2], ',
          'The roster for `Den Fox 1` is: ',
          '**Commander**, ',
          '*Officer\\*1*, ',
          '*Officer\\*2*, ',
          'Private\\_1, ',
          'Private\\_2, ',
          'Private\\_3, ',
          'Private\\_4',
        ].join(''),
      }, 'valid response, respecting order of rank and join date, formatting as needed');

      st.ok(clanList.isDone() && clanInfo.isDone(), 'made two wotblitz api calls');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('invalid tag format argument', st => {
    callRoster({author: 'jake3 [NOAME]'}, {account_id: 10996725}, 'NO@ME').then(result => {
      st.notOk(result, 'resolved without a response');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('valid tag argument, but empty result', st => {
    var clanList = nock('https://api.wotblitz.com')
      .post('/wotb/clans/list/')
      .query({
        search: 'NOT23',
        limit: null,
        page_no: 1,
        fields: 'clan_id,tag',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {status: 'ok', meta: {count: 0}, data: []});

    callRoster({author: 'bill3 [NOT22]'}, {account_id: 10996726}, 'NOT23').then(result => {
      st.notOk(result, 'resolved without a response');
      st.ok(clanList.isDone(), 'made wotblitz api call');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('valid tag argument, but no clan found', st => {
    var clanList = nock('https://api.wotblitz.com')
      .post('/wotb/clans/list/')
      .query({
        search: 'NOT2',
        limit: null,
        page_no: 1,
        fields: 'clan_id,tag',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {
          count: 3,
        },
        data: [
          {clan_id: 24, tag: 'NOT20'},
          {clan_id: 43, tag: 'NOT2A'},
          {clan_id: 57, tag: 'NOT2B'},
        ],
      });

    callRoster({author: 'jake3 [NOT21]'}, {account_id: 10996726}, 'NOT21').then(result => {
      st.notOk(result, 'resolved without a response');
      st.ok(clanList.isDone(), 'made wotblitz api call');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.end();
});