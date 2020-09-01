let host = "http://127.0.0.1:8080/ashioarae/"

let messageType = {
    error: "red",
    good: "green",
    info: "black"
}

async function ajaxInit() {
    let config = await getConfig();
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
}

ajaxInit().then();

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

/**
 * 增加消息
 * @param text 消息文本
 * @param color 消息颜色
 * @param actionText 消息附带的按钮信息
 * @param action 消息按钮事件
 */
function message(text, color, actionText, action) {
    let messageItem = $(".messageItem").first().clone();
    $("#message").append(messageItem);
    let p = messageItem.find("p");
    $(p).text(text).css("color", color)
    if (actionText && action) {
        let button = messageItem.find(".button")
        button.text(actionText);
        button.click(() => {
            action();
            messageItem.remove();
            if ($("#message").children().length === 0) {
                $("#clearMessage").click();
            }
        });
        button.show();
    }
    messageItem.show();
    $("#clearMessage").show();
}

$(function (){
    // 初始化清除消息按钮
    $("#clearMessage").click(() => {
        $("#clearMessage").hide();
        $("#message").empty();
    });
})


async function getConfig() {
    return await new Promise(resolve => {
        chrome.storage.sync.get(null, (c) => {
            resolve(c);
        });
    });
}

function setConfig(config) {
    chrome.storage.sync.set(config);
}

