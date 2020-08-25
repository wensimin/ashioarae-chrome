let host = "http://127.0.0.1:8080/"

let messageType = {
    error: "red",
    good: "green",
    info: "black"
}

getConfig().then(config => {
    $.ajaxSetup({
        headers: {
            "Authorization": "Basic " + btoa(config["username"] + ":" + config["password"])
        },
        contentType: 'application/json; charset=utf-8',
        error: function (result) {
            if (result.status === 401) {
                message("认证失败,检查用户名和密码", messageType.error);
            } else if (result.status === 500) {
                if (result.responseJSON.type === "error") {
                    message(result.responseJSON.message, messageType.error);
                }
            } else {
                message("未知错误", messageType.error);
            }
        },
        beforeSend: function () {
            startLoad();
        },
        complete: function () {
            stopLoad();
        }
    });
})

let xhrCount = 0

function startLoad() {
    xhrCount++;
    $("#loaderParent").show();
}

function stopLoad() {
    if (--xhrCount === 0) {
        $("#loaderParent").hide();
    }
}


function message(text, color) {
    let p = document.createElement("p")
    $(p).text(text).css("color", color)
    $("#message").append(p);
    $("#clearMessage").show();
}


async function getConfig() {
    let config = {};
    await new Promise(resolve => {
        chrome.storage.sync.get(null, (c) => {
            config = c;
            resolve();
        });
    })
    return config;
}

