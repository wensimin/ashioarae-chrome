$(function () {
    //初始化数据
    initData();
    //初始化事件
    initAction();
})
let typeList = [{
    type: "bilibili",
    domain: "bilibili.com",
    needCookie: ["SESSDATA", "bili_jct", "DedeUserID"],
    headEdit: true,
    nickEdit: false
}, {
    type: "steam",
    domain: "steamcommunity.com",
    needCookie: null,
    headEdit: true,
    nickEdit: false
}, {
    type: "twitter",
    domain: "twitter.com",
    needCookie: null,
    headEdit: true,
    nickEdit: false
}];

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
            $.ajax(host + "ashi/head/" + t.type, {type: "put"}).then(() => {
                message(t.type + ":头像更新完毕", messageType.good);
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
                cookie: cookie
            })).then(() => {
                    // 请求当前数据
                    $.get(host + "ashi/" + t.type, null, function (res) {
                        let item = $("#ashiItem").clone();
                        item.find(".type").html(t.type);
                        let nickInput = item.find(".nickValue")
                        nickInput.val(res.nickname);
                        nickInput.prop("disabled", !t.nickEdit);
                        item.find(".headImage").prop("src", res.headImage);
                        let container = $("#container");
                        container.append(item);
                        item.show();
                    })
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
    let cookieString = "";
    await new Promise((resolve) => {
        chrome.cookies.getAll({domain: domain}, function (cookies) {
            if (!cookies) {
                message(domain + "的cookie未获取", messageType.info);
            }
            cookies.forEach(function (c) {
                if (needCookie) {
                    if (needCookie.includes(c.name)) {
                        if (cookieString) {
                            cookieString += "; ";
                        }
                        cookieString += c.name + "=" + c.value;
                    }
                } else {
                    if (cookieString) {
                        cookieString += "; ";
                    }
                    cookieString += c.name + "=" + c.value;
                }

            });
            resolve();
        });
    })
    return cookieString;
}