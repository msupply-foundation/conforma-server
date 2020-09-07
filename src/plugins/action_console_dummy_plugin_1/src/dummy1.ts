module.exports["dummy1"] = function (parameters: any) {
  try {
    console.log("This is a dummy plugin");
    return {
      status: "Success",
      error_log: "",
    };
  } catch (error) {
    return {
      status: "Fail",
      error_log: "There was a problem",
    };
  }
};
