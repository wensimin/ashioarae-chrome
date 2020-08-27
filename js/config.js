let host = "http://127.0.0.1:8080/ashioarae/"

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
        beforeSend: function () {
            startLoad();
        },
        complete: function () {
            stopLoad();
        }
    });
    $(document).ajaxError((e, xhr) => {
        if (xhr.status === 401) {
            message("认证失败,检查用户名和密码", messageType.error);
        } else if (xhr.status === 500) {
            message(xhr.responseJSON.message, messageType.error);
        } else {
            message("未知错误", messageType.error);
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


function message(text, color, actionText, action) {
    let messageItem = $(".messageItem").first().clone();
    $("#message").append(messageItem);
    let p = messageItem.find("p");
    $(p).text(text).css("color", color)
    if (actionText && action) {
        let button = messageItem.find("button")
        button.text(actionText);
        button.click(action);
        button.show();
    }
    messageItem.show();
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

