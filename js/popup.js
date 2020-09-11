$(function () {
    //初始化数据
    initData().then();
    //初始化事件
    initAction();
})


/**
 * 初始化页面的事件
 */
function initAction() {
    $("#imageFile").change(() => {
        let formData = new FormData();
        formData.append('file', $("#imageFile")[0].files[0]);
        $.ajax({
            url: host + "file",
            type: "POST",
            cache: false,
            data: formData,
            processData: false,
            contentType: false
        }).done(res => {
            let preHead = $("#preHeadImage");
            preHead.prop("src", host + "file/public/" + res + "?time=" + new Date().getTime());
            preHead.attr("upPath", res);
        });
    });
    $("#update").click(() => {
        $.post(host + "ashi/pre", JSON.stringify({
            nickname: $("#preNick").val(),
            headImage: $("#preHeadImage").attr("upPath")
        })).done(() => {
            message("预更新信息已保存,开始同步各平台", messageType.good);
            update().then();
        });
    });
}

/**
 * 错误消息
 * @param t 当前的目标target平台
 * @param res http res
 * @param actionText 消息按钮文本
 * @param action 附带的事件
 */
function errorMessage(t, res, actionText, action) {
    if (res.status === 500) {
        if (res.responseJSON.type === "cookie") {
            message(t.type + ": cookie失效", messageType.error, "跳转获取cookie", () => {
                window.open(t.cookiePage);
            });
        } else if (res.responseJSON.type === "timeout") {
            message(t.type + ": 获取信息超时", messageType.error, actionText, action);
        } else if (res.responseJSON.type === "error") {
            message(t.type + "出现错误: " + res.responseJSON.message, messageType.error);
        }
    } else {
        message(t.type + "未知错误", messageType.error);
    }
}


/**
 * 进行同步
 */
async function update() {
    for (const t of typeList) {
        let config = await getConfig()
        let tarConfig = config.tarConfig;
        if (!tarConfig[t.type]) {
            continue;
        }
        if (t.nickEdit) {
            $.ajax(host + "ashi/nick/" + t.type, {type: "put"}).then(() => {
                message(t.type + ":昵称更新完毕", messageType.good);
            });
        }
        if (t.headEdit) {
            updateHead(t);
        }
    }
}

/**
 * 更新头像
 * @param t  目标平台
 */
function updateHead(t) {
    $.ajax(host + "ashi/head/" + t.type, {type: "put", global: false}).then(() => {
        message(t.type + ":头像更新完毕", messageType.good);
    }).fail(res => {
        errorMessage(t, res, "重试", () => updateHead(t));
    });
}


/**
 * 初始化数据
 */
async function initData() {
    // 获取预更新数据
    $.get(host + "ashi", null).then(res => {
        let item = $("#ashiData")
        let nickInput = item.find(".nickValue")
        nickInput.val(res.nickname);
        let image = item.find(".headImage")
        image.prop("src", host + "file/public/" + res.headImage);
        image.attr("upPath", res.headImage);
        image.click(() => {
            item.find("#imageFile").click();
        })
    });
    //初始化所有其他目的类型
    for (const t of typeList) {
        let config = await getConfig()
        let tarConfig = config.tarConfig;
        if (!tarConfig[t.type]) {
            continue;
        }
        // 异步发起请求加速
        new Promise(async () => {
            let cookie = await getCookieString(t.domain);
            //上传cookie
            $.post(host + "ashi", JSON.stringify({
                type: t.type,
                cookies: cookie
            })).then(() => getAshiTarget(t));
        }).then();
    }
}

/**
 * 获取对应平台的信息
 * @param t target
 */
async function getAshiTarget(t) {
    // 请求当前数据
    $.ajax(host + "ashi/" + t.type, {type: "get", global: false}).then(res => {
        let item = $(".ashiItem").first().clone();
        item.find(".type").html(t.type);
        let nickLabel = item.find(".nickValue")
        nickLabel.html(res.nickname);
        let url = new URL(res.headImage);
        if (t.cacheClear) {
            url.searchParams.set('_t_', new Date().getTime().toString());
        }
        item.find(".headImage").prop("src", url.toString());
        item.find(".updateButton").click(() => updateHead(t));
        let container = $("#container");
        container.append(item);
        item.show();
    }).fail(res => {
        errorMessage(t, res, "重试", () => getAshiTarget(t));
    });
}




