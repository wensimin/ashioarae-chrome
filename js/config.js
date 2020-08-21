let host = "http://127.0.0.1:8080/"


getConfig().then(config => {
    $.ajaxSetup({
        headers: {
            "Authorization": "Basic " + btoa(config["username"] + ":" + config["password"])
        },
        contentType: 'application/json; charset=utf-8',
        error: function (result) {
            //TODO 错误提示不能使用alert
            if (result.status === 401) {
                $("#message").html("认证失败,检查用户名和密码");
            } else {
                $("#message").html("未知错误");
            }
        }
    });
})

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

