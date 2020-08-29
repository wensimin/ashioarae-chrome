$(function () {
    //初始化数据
    initData();
    //初始化事件
    initAction();
})
let typeList = [{
    type: "bilibili",
    domain: "bilibili.com",
    headEdit: true,
    nickEdit: false
}, {
    type: "steam",
    domain: "steamcommunity.com",
    headEdit: true,
    nickEdit: false
}, {
    type: "twitter",
    domain: "twitter.com",
    headEdit: true,
    nickEdit: false
}, {
    type: "github",
    domain: "github.com",
    headEdit: true,
    nickEdit: false
}, {
    type: "google",
    domain: "google.com",
    headEdit: true,
    nickEdit: false
}
];

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
            preHead.prop("src", host + "file/public/" + res + "?time=" + new Date());
            preHead.attr("upPath", res);
        });
    });
    $("#update").click(() => {
        $.post(host + "ashi/pre", JSON.stringify({
            nickname: $("#preNick").val(),
            headImage: $("#preHeadImage").attr("upPath")
        })).done(() => {
            message("预更新信息已保存,开始同步各平台", messageType.good);
            update();
        });
    });
    $("#clearMessage").click(() => {
        $("#clearMessage").hide();
        $("#message").empty();
    });
}

function errorMessage(t, res) {
    if (res.status === 500) {
        if (res.responseJSON.type === "cookie") {
            message(t.type + ": cookie失效", messageType.error, "跳转获取cookie", () => {
                window.open("https://" + t.domain);
            });
        } else if (res.responseJSON.type === "timeout") {
            message(t.type + ": 获取信息超时", messageType.error);
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
function update() {
    typeList.forEach(t => {
        if (t.nickEdit) {
            $.ajax(host + "ashi/nick/" + t.type, {type: "put"}).then(() => {
                message(t.type + ":昵称更新完毕", messageType.good);
            });
        }
        if (t.headEdit) {
            $.ajax(host + "ashi/head/" + t.type, {type: "put", global: false}).then(() => {
                message(t.type + ":头像更新完毕", messageType.good);
            }).fail(res => {
                errorMessage(t, res);
            });
        }
    });
}

/**
 * 初始化数据
 */
function initData() {
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
    typeList.forEach(function (t) {
        getCookieString(t.domain, t.needCookie).then(cookie => {
            //上传cookie
            $.post(host + "ashi", JSON.stringify({
                type: t.type,
                cookie: "null=null",
                cookies: cookie
            })).then(() => {
                    // 请求当前数据
                    $.ajax(host + "ashi/" + t.type, {type: "get", global: false}).then(res => {
                        let item = $(".ashiItem").first().clone();
                        item.find(".type").html(t.type);
                        let nickInput = item.find(".nickValue")
                        nickInput.val(res.nickname);
                        nickInput.prop("disabled", !t.nickEdit);
                        item.find(".headImage").prop("src", res.headImage);
                        let container = $("#container");
                        container.append(item);
                        item.show();
                    }).fail(res => {
                        errorMessage(t, res);
                    });
                }
            );
        });
    });
}

/**
 * 获取指定域名的cookie
 * @param domain 域名
 * @param needCookie 需要的cookie列表
 * @returns {Promise<string>} cookieString
 */
async function getCookieString(domain, needCookie) {
    let resCookie = "";
    await new Promise((resolve) => {
        chrome.cookies.getAll({domain: domain}, function (cookies) {
            if (cookies.length === 0) {
                message(domain + "的cookie未获取", messageType.info);
                return;
            }
            resCookie = cookies;
            resolve();
        });
    })
    return resCookie;
}