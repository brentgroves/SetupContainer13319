const mariadb = require("mariadb");
const mqtt = require('mqtt');
const common = require('@bgroves/common');
const utils = require('./utils');

const {
  MQTT_SERVER,
  MYSQL_HOSTNAME,
  MYSQL_USERNAME,
  MYSQL_PASSWORD,
  MYSQL_DATABASE
} = process.env;

/*
const MQTT_SERVER='localhost';
const MYSQL_HOSTNAME= "localhost";
const MYSQL_USERNAME= "brent";
const MYSQL_PASSWORD= "JesusLives1!";
const MYSQL_DATABASE= "mach2";
*/
const connectionString = {
    connectionLimit: 5,
    multipleStatements: true,
    host: MYSQL_HOSTNAME,
    user: MYSQL_USERNAME,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE
  }
  
common.log(`user: ${MYSQL_USERNAME},password: ${MYSQL_PASSWORD}, database: ${MYSQL_DATABASE}, MYSQL_HOSTNAME: ${MYSQL_HOSTNAME}`);
  
const pool = mariadb.createPool( connectionString);
  

async function InsertSetupContainer(params) {
    var p = utils.conversions(params);
    common.log(`ProdServer=${p.ProdServer},Name=${p.Name},Multiple=${p.Multiple},Companion=${p.Companion}`);
    let conn;
    try {
      conn = await pool.getConnection();      
      const result = await conn.query('call InsertSetupContainer(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [p.TransDate,p.PCN,p.ProdServer,p.Workcenter,p.CNC,p.Part_No,p.Name,p.Multiple,p.Container_Note,p.Cavity_Status_Key,p.Container_Status,
       p.Defect_Type,p.Serial_No,p.Setup_Container_Key,p.Count,p.Part_Count,p.Part_Key,p.Part_Operation_Key,p.Standard_Container_Type,
       p.Container_Type_Key,p.Parent_Part,p.Parent,p.Cavity_No,p.Master_Unit_Key,p.Workcenter_Printer_Key,p.Master_Unit_No,
       p.Physical_Printer_Name,p.Container_Count,p.Container_Quantity,p.Default_Printer,p.Default_Printer_Key,p.Class_Key,p.Quantity,
       p.Companion,p.Container_Type,p.Container_Type_Description,p.Sort_Order]);
      let msgString = JSON.stringify(result[0]);
      const obj = JSON.parse(msgString.toString()); // payload is a buffer
      common.log(obj);
    } catch (err) {
      // handle the error
      console.log(`SetupContainer: Error =>${err}`);
    } finally {
      if (conn) conn.release(); //release to pool
    }
  }
  
function main() {
  common.log(`SetupContainer13319 has started`);
  const mqttClient = mqtt.connect(`mqtt://${MQTT_SERVER}`);

  mqttClient.on('connect', function() {
    mqttClient.subscribe('Plex13319', function(err) {
      if (!err) {
        common.log('SetupContainer has subscribed to: Plex13319');
      }
    });
  });
  // message is a buffer
  mqttClient.on('message', function(topic, message) {
    const params = JSON.parse(message.toString()); // payload is a buffer
    common.log(`SetupContainer: received mqtt message`);
    InsertSetupContainer(params);
  });
}
main();
