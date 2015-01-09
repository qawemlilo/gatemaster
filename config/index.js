/**
 * Application config
 *
**/

module.exports = {

  db: process.env.MONGOHQ || 'mongodb://localhost:27017/gatemaster',

  agendCollection: process.env.AGENDA || 'cronjobs',

  sessionSecret: process.env.SESSION_SECRET || 'I am a wizard',

  gmail: {
    user: process.env.GMAIL_USER || 'postmaster@sandbox697fcddc09814c6b83718b9fd5d4e5dc.mailgun.org',
    password: process.env.GMAIL_PASSWORD || '29eldds1uri6'
  },

  twilio: {
    sid: process.env.TWILIO_SID || 'ACcc464743f64498ac6a7c231022c01e9c',
    token: process.env.TWILIO_TOKEN || '20246486eff6b593c8d23c8812dbb084'
  }
};
