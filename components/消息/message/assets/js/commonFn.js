const commonFn = {
    formateDetailPath(item, url) {
        if (!url) return
        let reg = /\{(.+?)\}/g                 // 匹配花括号
        let outMeta = JSON.parse(item.outMeta)
        let matchUrl = url.match(reg)
        let outLinkFlag = url.indexOf('http') > -1
        if (matchUrl) {
            // 把所有花括号包裹的内容换成对应参数
            matchUrl.forEach((ele) => {
                let param = ele.substring(1, ele.length - 1)
                let content = outMeta[param] !== undefined ? outMeta[param] : item[param]
                url = url.replace(ele, content)
            })
        }
        if (outMeta.jumpUrl) {
            url = outMeta.jumpUrl
            outLinkFlag = url.indexOf('http') > -1
        }
        if (outLinkFlag) {
            common.inAppBrowserOpen(url)
        } else {
            window.location.href = url
        }
    }
}
export default commonFn