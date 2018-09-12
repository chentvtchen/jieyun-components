<template>
    <div class="upload">
        <div class="clip-wp" v-show="panelVisible">
            <x-header class="header" title="编辑图片" :style="{'backgroundColor': themeColor}">
                <a slot="left" @click="panelVisible = false">取消</a>
                <a slot="right" @click="crop">确定</a>
            </x-header>
            <div class="test" :style="{height: screenHeight + 'px'}">
                <img id="image" :src="url" alt="Picture">
            </div>
            <div class="bottom" @click="ifOriginImg = !ifOriginImg">
                <input type="checkbox" v-model="ifOriginImg">原图({{fileSize.num + fileSize.unit}})
            </div>
        </div>
        <input type="file" ref="uploadFile" id="uploadFile" style="display:none" accept="image/*" @change="upload"/>

        <popup v-model="popupVisible" popup-transition="popup-fade" position="bottom">
            <cell @click.native="byMobile()" style="color:#333;background:#fff;text-align:center;">
                <div slot="title" style="text-align:center;" >拍照</div>
            </cell>
            <cell @click.native="byAlbum()" style="color:#333;background:#fff;text-align:center;">
                <div slot="title" style="text-align:center;">从相机中选择</div>
            </cell>
            <group>
                <cell @click.native="cancelBtn()" style="color:#333;background:#fff;text-align:center;">
                    <div slot="title" style="text-align:center;">取消</div>
                </cell>
            </group>
        </popup>
    </div>
    
</template>
<script>
import {XHeader,  XButton , TransferDomDirective as TransferDom ,Popup,Cell,Group} from 'vux'
import Cropper from 'cropperjs';
import lrz from 'lrz';
export default {
    data(){
        return{
            HostFileUpload: 'http://192.168.100.200:8888/file/',
            cropper : '',                       //裁剪图片
            croppable : false,
            panelVisible : false,
            url : '',
            postHeaderImg : '',
            isWechat : constGlobal.isWeChat(),                     //判断是否是微信
            popupVisible : false,             //图片上传弹框是否显示
            isCancel : false,
            ifOriginImg: false,             //是否是原图
            screenHeight: 500,
            fileSize: {
                unit: '',
                num: 0
            },
            fileInfo: {
                name: '',
                id: ''
            }
        }
    },
    props:{
        config : {
            type : Object,
            default : {
                isCrop : false,
                cropBoxResizable:false,         //是否可以调整裁剪框的大小
                minCropBoxWidth:144,            //裁剪层的最小宽度
                minCropBoxHeight:192,           //裁剪层的最小高度
                aspectRatioWidth : 144,          //裁剪框宽高比之宽度
                aspectRatioHeight : 192,        //裁剪框宽高比之高度
            }
        },
        maxUploadMb: {                          //上传到后台图片最大mb
            type: Number,
            default: 5,                 
        },
        quality: {                   //压缩图片的质量
            type: Number,
            default: 0.8,       
        },
        themeColor: {          //主题颜色
            type: String,
            default: '#1aad19'
        }
    },
    components:{
        XHeader,
        XButton,
        Popup,Cell,Group
    },
    directives: {
        TransferDom
    },
    mounted(){
        // 区域宽度
        this.screenHeight = document.documentElement.clientHeight - 50;
        /**
         * 初始化裁剪框
        */
        var self = this;
        if(this.config.isCrop){
            var image = document.getElementById('image');
            this.cropper = new Cropper(image, {
                aspectRatio : this.config.aspectRatioWidth/this.config.aspectRatioHeight,
                viewMode : 1,
                background : false,
                zoomable : true,
                cropBoxResizable : this.config.cropBoxResizable,             //是否可以调整裁剪框的大小
                minCropBoxWidth : this.config.minCropBoxWidth,              //裁剪层的最小宽度
                minCropBoxHeight : this.config.minCropBoxHeight,            //裁剪层的最小高度
                dragMode:'move',                                            //可以拖动图片
                ready: function () {
                    self.croppable = true;
                },
            });
        }
    },
    methods:{
        /**
         * 图片上传事件
        */
        uploadEvent(){
            this.$refs.uploadFile.value = null;
            if(this.isWechat){
                document.getElementById("uploadFile").click();
            }else{
                this.popupVisible = true;
            }
        },
         /**
         * 选择图片
        */
        upload (e) {
            let files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;
            this.url = this.getObjectURL(files[0]);
            this.fileInfo.name = files[0].name;
            this.getFileSize(files[0].size);
            if(this.config.isCrop){ //裁剪
                if(this.cropper){
                    this.cropper.replace(this.url);
                }
                this.panelVisible = true;
            }else{ 
                this.browserImgUpload(files[0]);
            }
            
        },
        // 获取文件大小
        getFileSize(limit){
            this.fileSize.bNum = limit;
            let kb = 1024,
                mb = kb * 1024;
            if(limit < kb) {    //小于1k
                this.fileSize.unit = 'B';
                this.fileSize.num = limit.toFixed(2)   
            }else if(limit < mb){                       //小于1mb
                this.fileSize.unit = 'KB';
                this.fileSize.num = (limit/kb).toFixed(2)   
            }else {                                     //小于1gb
                this.fileSize.unit = 'MB';
                this.fileSize.num = (limit/mb).toFixed(2)   
            }
        },        
        /**
         * 显示图片点击上传弹出框
        */
        showFileSelect(){
            if( this.isCancel == false){
                this.popupVisible = true;
            }else{
                this.isCancel = !this.isCancel;
            }
        },
        /**
         * 取消选择图片
        */
        cancelBtn(){
            this.popupVisible = false;
            this.isCancel = !this.isCancel;
        },
        /**
         * 拍照
        */
        byMobile: function() {
            this.popupVisible = false;
            navigator.camera.getPicture(this.takePictureSuccess, this.takePictureFail, {
                quality: 100,
                allowEdit:false,
                correctOrientation: true,
                saveToPhotoAlbum: false,
                destinationType: Camera.DestinationType.FILE_URI
            });
        },
        /**
         * 从相机中选择
        */
        byAlbum: function() {
            this.popupVisible = false;
            navigator.camera.getPicture(this.takePictureSuccess, this.takePictureFail, {
                quality: 100,
                allowEdit:false,
                correctOrientation: true,
                saveToPhotoAlbum: false,
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                destinationType: Camera.DestinationType.FILE_URI
            });
        },
        /**
         * 获取图片成功
        */
       //手机端computeScale暂时没弄好
        takePictureSuccess:function(imageData){
            let _this = this,
                options = {
                    quality: 100,
                    widthRatio:this.config.aspectRatioWidth,
                    heightRatio:this.config.aspectRatioHeight,
                },
                imgInfo = imageData.split('/');    
            this.fileInfo.name = imgInfo[imgInfo.length - 1];
            // 裁剪
            if(this.config.isCrop) {
                plugins.crop( function success( url ){
                    url = url.split('?');
                    _this.uploadImgApp( url[0] );
                },function fail( err ){
                },imageData , options)
            }else {  
                this.browserImgUpload(imageData);
            }
        },
        /**
         * 获取图片失败
        */
        takePictureFail:function(err){
            if(err !== 'No Image Selected') {
                common.toastMsg('获取图片失败');
            }
        },
        /**
         * app图片上传
        */
        uploadImgApp( fileUrl){
            var _this = this;
            var url = this.HostFileUpload + 'upload';
                
            var options = new FileUploadOptions();
            var name = fileUrl.substring( fileUrl.lastIndexOf('/')+1);
            options.chunkedMode = false;  
            options.fileKey = "file";  
            options.fileName = name.indexOf("?")>=0 ? name.substring(0,name.indexOf("?")) : name;  
            options.mimeType = "image/jpeg";  
            options.httpMethod = "POST";  
            this.fileInfo.name = options.fileName;
            var fileTransfer = new FileTransfer();
            var successCallback = function( r){
                _this.popupVisible = false;
                var res = JSON.parse( r.response )
                if( res.status == 0){
                    if( res.data && res.data.length > 0){
                        _this.fileInfo.id = res.data[0];
                        _this.$emit('getImgData', _this.fileInfo);
                    }
                }
            }
            var errorCallback = function( error){
                _this.popupVisible = false;
                common.toastMsg('图片上传失败');
            }
            fileTransfer.upload(
                fileUrl,
                encodeURI(url),  //服务器上传的路径  
                successCallback,  //成功的回调  
                errorCallback,    //失败的回调  
                options);         //配置项  
        },
       
        /**
         * dataURL转blob
        */
        dataURLtoFile(dataurl,filename) {
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr],filename, {type:mime});
        },
        /**
         * 裁剪
        */
        crop () {
            var croppedCanvas,
                roundedCanvas;
            this.panelVisible = false;
            if (!this.croppable) {
                return;
            }
            croppedCanvas = this.cropper.getCroppedCanvas();
            roundedCanvas = this.getRoundedCanvas(croppedCanvas);
            this.postHeaderImg = roundedCanvas.toDataURL('image/jpeg', 1.0);       //把canvas转换成jpeg图片
            var file = this.dataURLtoFile(this.postHeaderImg,'headerImg.png');      
            this.browserImgUpload(file);
        },
        // 上传到后台获取东西
        browserImgUpload(file) {
            let qualityNum = this.ifOriginImg ? 1 : this.quality;       //是否是原图
            if(file.size) {
                qualityNum *= this.computeScale(file.size);
            }
            // 压缩文件大小
            lrz( file ,{
                quality: qualityNum
            }).then( res=>{
                let url = this.HostFileUpload + 'upload'
                http.apiPost( url , res.formData ).then( res=>{
                    if( res.status == 0){
                        if( res.data && res.data.length > 0){
                            this.fileInfo.id = res.data[0];
                            this.$emit('getImgData', this.fileInfo);
                        }
                    }else{
                        common.toastMsg( res.message )
                    }
                })
            }).catch( err=>{
                common.toastMsg('图片上传失败，请稍后重试！');
            })
        },
        // 计算压缩比例大小,控制图片最大, 默认为5m,把图片压缩到和原来一样
        computeScale(size) {
            let mb = this.fileSize.bNum / (1024 * 1024),
                scale = (this.fileSize.bNum / size.toFixed(2)),         
                max = this.maxUploadMb;
            while(mb > max) {                       //把图片控制在一定范围之下，默认为5m     
                scale = (max / mb).toFixed(2);
            }
            return scale;
        }
       
    }
}
</script>
<style lang="scss">
    @import './clipper.scss';
    .upload {
        .header {
            background-color: #3292fe;
            .vux-header-left a,
            .vux-header-right a {
                color: #fff;
            }
        }
        .bottom {
            position: absolute;
            bottom: 5px;
            width: 100%;
            text-align: center;
            color: #fff;
            font-size: 15px;
            input {
                margin-right: 2px;
                margin-top: 3px;
            }
        }
    }
    .vux-popup-dialog{
        .weui-cell{
            padding:12px 15px;
        }
        .vux-no-group-title{
            margin-top:5px !important;
        }
    }
    .clip-wp{
        position: fixed;
        width: 100%;
        top: 0;
        left: 0;
        right:0;
        bottom: 0;
        z-index: 11;
        background-color: #000;
        text-align: center;
        button{
            position: absolute;
            z-index: 99;
            right: 20px;
            top: 30px;
        }
    
    }
</style>

