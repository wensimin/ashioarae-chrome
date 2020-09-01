function initTar(config) {
    let tarConfig = config.tarConfig;
    if (!tarConfig) {
        tarConfig = {
            bilibili: false,
            steam: false,
            twitter: false,
            github: false,
            google: false,
            instagram: false
        };
        config.tarConfig = tarConfig;
        setConfig(config);
    }
    let tarConfigs = $("#tarConfigs");
    new Map(Object.entries(tarConfig)).forEach((value, key) => {
        let tarConfigItem = $(".tarConfigItem").first().clone();
        tarConfigItem.find("label").html(key);
        let radio = tarConfigItem.find(".radio");
        radio.prop("checked", value);
        radio.click(() => {
            tarConfig[key] = radio.prop("checked");
            config.tarConfig = tarConfig;
            setConfig(config);
        });
        tarConfigs.append(tarConfigItem);
        tarConfigItem.show();
    })
}

$(async function () {
    let config = await getConfig();
    $("#username").val(config.username);
    $("#password").val(config.password);
    initTar(config);
    $("#auth").click(function () {
        let username = $("#username").val();
        let password = $("#password").val();
        config.username = username;
        config.password = password;
        setConfig(config);
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