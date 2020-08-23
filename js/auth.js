$(function () {
    chrome.storage.sync.get(null, (config) => {
        $("#username").val(config["username"]);
        $("#password").val(config["password"]);
    });
    $("#auth").click(function () {
        let username = $("#username").val();
        let password = $("#password").val();
        let config = {"username": username, "password": password};
        chrome.storage.sync.set(config);
        $.ajax(host + "user", {
            headers: {
                "Authorization": "Basic " + btoa(config["username"] + ":" + config["password"])
            },
            method: "get"
        }).done(result => {
            if (result === username) {
                alert("认证成功,刷新页面");
            } else {
                alert("认证失败,检查用户名密码")
            }
        }).fail(r => {
            if (r.status === 401) {
                alert("认证失败,检查用户名密码")
            } else {
                alert("未知错误")
            }
        });
    });
});