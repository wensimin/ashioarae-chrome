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
        $.ajax({
            type: "GET",
            url: host + "user",
            headers: {
                "Authorization": "Basic " + btoa(username + ":" + password)
            },
            success: function (result) {
                if (result === username) {
                    alert("认证成功");
                }
            },
            error: function (result) {
                if (result.status === 401) {
                    alert("认证失败,检查用户名和密码");
                } else {
                    alert("未知错误");
                }
            }
        });
    });
});