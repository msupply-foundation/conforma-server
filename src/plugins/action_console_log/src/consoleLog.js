"use strict";
module.exports["consoleLog"] = function (parameters) {
    try {
        console.log("\nThe Console Log action is running...");
        console.log(parameters.message);
        return {
            status: "Success",
            error_log: "",
        };
    }
    catch (error) {
        return {
            status: "Fail",
            error_log: "There was a problem",
        };
    }
};
