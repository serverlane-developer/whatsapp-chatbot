import * as _ from "lodash";

function getlogged_line() {
  try {
    let logged_line = new Error().stack?.split("\n")[3];
    if (logged_line) {
      logged_line = logged_line.replace("    at", "").replace("(", "").replace(")", "");
      logged_line = logged_line.split(" ")[2] || logged_line.split(" ")[1];
      return logged_line;
    }
  } catch (error) {
    //todo
  }
  return "";
}

export const keysToHide = ["token", "password", "oldPassword", "newPassword", "key"];

export const hideSensitiveDataFromObject = (data: any) => {
  data = _.cloneDeep(data);
  for (let key of keysToHide) {
    // if key exists in logged object, replace value with "hidden"
    if (_.get(data, key, false)) _.set(data, key, "hidden");
  }
  return data;
};

function jsonify(orginalData: any, level = "info", showSensitiveDate = false) {
  let data = orginalData;
  if (typeof data === "number") {
    if (data % 1 === 0) {
      data = { message_int: data };
    } else {
      data = { message_float: data };
    }
  } else if (typeof data === "string") {
    data = { message_string: data };
  } else if (typeof data === "boolean") {
    data = { message_bool: data };
  } else if (typeof data === "bigint") {
    data = { message_bint: data };
  } else if (level === "error") {
    data = { error: data };
  } else if (level === "info" && data) {
    // hide credentials from logged objects
    if (!showSensitiveDate) data = hideSensitiveDataFromObject(data);
  }
  return data;
}

export const getLogObject = (data: any, level = "info", showSensitiveDate = false) => ({
  logged_at: getlogged_line(),
  data: jsonify(data, level, showSensitiveDate),
  timestamp: new Date().toISOString(),
});
