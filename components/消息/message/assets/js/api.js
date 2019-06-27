
import apiMethods from 'assets/js/http'
const http = apiMethods.methods
const messageUrl = constGlobal.HostMessage
const messageApi = {
    /**
    * @method 获取通知未读数量
    */
    getInfoNum: (params) => http.apiPost(messageUrl + 'unClick/search', params),
    /**
     * @method 获取通知列表或查看单个应用的消息
     */
    getInfoList: (params) => http.apiPost(messageUrl + 'msgList/search', params),
    /**
     * @method 获取消息类型
     */
    getNewsType: () => http.apiGet(messageUrl + 'appInfo/search'),
    /**
     * @method 获取消息类型中最新的一条消息
     */
    getNewsLastMsg: () => http.apiGet(messageUrl + 'lastMsg/searchByType?type=2'),
    /**
     * @method 获取用户每个应用需要提醒的消息数量(仅可用于”消息“统计应用未读消息)
     */
    getNewsInfoNum: () => http.apiGet(messageUrl + 'unRead/count?type=2'),
    /**
     * @method 点击消息类型列表的时候，更新最后阅读时间
     */
    readNewsType: (params) => http.apiGet(messageUrl + 'readTime/update' + params),
    /**
     * @method 阅读一篇，更新最后阅读时间
     */
    readOne: (params) => http.apiGet(messageUrl + 'clickLog/add' + params),
    /**
     * @method 一键阅读
     */
    readAll: () => http.apiGet(messageUrl + 'readAll/update'),
    /**
     * @method 一键阅读
     */
    getMessageDetail: (id) => http.apiGet(messageUrl + 'msgDetail/search?msgId=' + id)
}
export default messageApi