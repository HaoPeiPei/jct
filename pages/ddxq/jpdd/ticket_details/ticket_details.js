// pages/ddxq/jpdd/ticket_details/ticket_details.js
var app = getApp();
var wwwRoot = app.globalData.wwwRoot;
var imgRoot = app.globalData.imgRoot;
var orderConfirmeTimer; //订单确认计时器
var countDownTimer; //倒计时计时器
var httpRequst = require("../../../../utils/requst.js");
const { getMD, getWeek } = require('../../../../utils/util.js');
var WxParse = require('../../../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    header_text:
    {
      "left_icon": imgRoot+"/images/back-b.png",
      "title_text": "国内机票下单",
      "right_icon": "",
    },
    imgRoot: imgRoot,
    single_return:"",
    priceDetailModalShow: false,
    endorseType: 0,
    endorseModalShow: false,
    mulLineModalShow: false,
    countDownFlag: false, //倒计开关
    order: {},
    depDate:'',
    depWeek:'',
    arrDate:'', 
    arrWeek:'',
    price: {},
    endorseModalContent: '',
    comeEndorseTitle: '',
    backEndorseTitle: '',
    jsAlertModalShow: false,
    currentTime: 60
  },
  //返回
  catchBackChange: function (e) {
    clearInterval(countDownTimer);
    clearInterval(orderConfirmeTimer);
    wx.navigateBack({
      delta: 1
    })
  },
  //拨打电话
  telephone(e){
    var phoneNumber = e.currentTarget.dataset.phonenumber;
    wx.makePhoneCall({
      phoneNumber: phoneNumber
    });
  },
  // 价格预览
  showPriceDetailModal:function(e){
    this.setData({
      priceDetailModalShow: true
    });
  },
  hidePriceDetailModal: function () {
    this.setData({
      priceDetailModalShow: false
    });
  },
  //显示退改详情
  showEndorse(carrier, sType){
    var that = this;
    httpRequst.HttpRequst(
      true,
      '/weixin/jctnew/ashx/airTicket.ashx',
      {
        "sdate": carrier.depDate,
        "carrier": carrier.carrier,
        "cab": carrier.cab,
        "action": "endorse"
      },
      "POST",
      res=> {
        var endorseModalContent = '';
        if (res.Success) {
            endorseModalContent ="<p>" + res.Data.replace(/\r\n/g, '</p><p>') + "</p>";
        }
        else {
            endorseModalContent ="<p>暂无此舱位退改签信息,请致电客服进行了解</p>";
        };
        that.setData({
            endorseModalContent: WxParse.wxParse('endorseModalContent', 'html', endorseModalContent, that, 5)
        });
    }); 
  },
  //显示单程退改详情
  showSingleEndorse(){
      this.setData({
          endorseModalShow: true,
          comeEndorseTitle: '退改签详情',
      });
      if (this.data.endorseModalContent == "") {
          this.showEndorse(this.data.order.airticketOrder.FlightInfos[0], "0");
      }
  },
  //显示往返退改详情
  showMultiEndorse(){
      this.setData({
          endorseType: 0,
          endorseModalShow: true,
          comeEndorseTitle: '去程退改签',
          backEndorseTitle: '回程退改签',
      });
      if (this.data.endorseModalContent == "") {
          this.showEndorse(this.data.order.airticketOrder.FlightInfos[0], "0");
      }
  },
  //切换去回程改签详情
  endorseTypeChange(e){
      var endorseType = e.currentTarget.dataset.endorsetype;
      this.setData({
          endorseType: endorseType,
          endorseModalShow: true,
          comeEndorseTitle: '去程退改签',
          backEndorseTitle: '回程退改签',
      });
      if(endorseType == 0){
          if(this.data.endorseModalContent == ''){
              this.showEndorse(this.data.order.airticketOrder.FlightInfos[0], "0");
          }
      }else if(endorseType == 1){
          if(this.data.endorseModalContent == ''){
              this.showEndorse(this.data.order.airticketOrder.FlightInfos[1], "1");
          }
      }
  },
 //显示往返机票详情
  showMulLineModal(){
    this.setData({
        mulLineModalShow: true
    });
  },
  //隐藏往返机票信息
  hideMulLineModal(e){
    this.setData({
        mulLineModalShow: false,
    });
  },
  //隐藏退改详情
  hideEndorseModal(e){
    this.setData({
        endorseModalShow: false,
    });
  },
 
  //加载订单详情
  loadOrderDetail(){
    var that = this;
    var params = {
      orderId: this.data.orderId,
      action:"getorderbyid"
    }
    httpRequst.HttpRequst(false, '/weixin/jctnew/ashx/airTicket.ashx', params, 'POST', function (res) {
      if(res.Success){
        var data = JSON.parse(res.Data);
        var flightInfos = data.airticketOrder.FlightInfos;
        for (let index = 0; index < flightInfos.length; index++) {
            const element = flightInfos[index];
            element['depDate'] = getMD(element.dep_date);
            element['depWeek'] = getWeek(element.dep_date);
            element['arrDate'] = getMD(element.arr_date);
            element['arrWeek'] = getWeek(element.arr_date);
        };
        var passeners = data.airticketOrder.Passengers;
        for (var j = 0; j < passeners.length; j++) {
          passeners[j]['TypeName'] = that.getType(passeners[j]);
          passeners[j]["CertTypeName"] = that.getCertType(passeners[j]);
          passeners[j]["CertNoCont"] = that.getCertNo(passeners[j]);
        };
        that.setData({
          order:data
        });
        that.caculatePirce();
      }
      if (data.airticketOrder.Order.status == 0) {
        that.setData({
          jsAlertModalShow: true
        });
        if(!that.data.countDownFlag){
          that.countDown(); //开始倒计时
          that.setData({
            countDownFlag: true
          });
        }
        orderConfirmeTimer =setTimeout(() => {
          that.loadOrderDetail();
        }, 6000);
      }else if (data.airticketOrder.Order.status == 1){
        clearInterval(countDownTimer);
        clearInterval(orderConfirmeTimer);
        that.setData({
          jsAlertModalShow: false
        });
        that.createPayPara();
      }
    });
  },
  getType(item) {
    if (item.passenger_type == "0") {
      return "";
    }
    else if (item.passenger_type == "1") {
        return "(儿童)";
    } else {
        return "(婴儿)";
    }
  },
  getCertType(item) {
    if (item.passenger_type == "0") {
      if (item.cert_type == "1") {
          return "身份证";
      }
      else if (item.cert_type == "2") {
          return "护照";
      } else {
          return "其他";
      }
    } else {
        return "生日";
    }
  },
  getCertNo (item) {
    if (item.passenger_type == "0") {
      return item.cert_no;
    } else {
        return item.birthday;
    }
  },
  //计算价格明细
  caculatePirce(){
    var order = this.data.order;
    var price = this.data.price;
    var ticketAdultPrice = 0;       //成人票价
    var ticketChildPrice = 0;       //儿童票价
    var ticketBabyPrice = 0;        //婴儿票价
    var taxes = 0;                    //税费
    var insurance_price = 0;//保险
    var refund = 0;                 //现返
    var servicePrice = 0;               
    var delivery_price = order.airticketOrder.Order.delivery_price;//快递费
    var passengs = order.airticketOrder.Passengers;//机票乘机人表
    var servers = order.serviceOrders;//服务表
    var adultCount = 0;
    var childCount = 0;
    var babyCount = 0;
    var adultPriceArr = passengs.filter(v=>v.passenger_type==0);
    var tmpName = "", tmpCert_no = "", tmpBirthday="";
    for (var i = 0; i < adultPriceArr.length; i++) {
        refund += adultPriceArr[i].refund;
        ticketAdultPrice += adultPriceArr[i].sale_price;
        taxes += adultPriceArr[i].fee + passengs[i].tax;
        insurance_price += adultPriceArr[i].insurance_count * 40;
        tmpCert_no = adultPriceArr[i].cert_no;
        tmpName = adultPriceArr[i].passenger_name;
        if (i + 1 < adultPriceArr.length && tmpCert_no == adultPriceArr[i + 1].cert_no && tmpName == adultPriceArr[i + 1].passenger_name)
        {
            refund += adultPriceArr[i+1].refund;
            ticketAdultPrice += adultPriceArr[i+1].sale_price;
            taxes += adultPriceArr[i+1].fee + passengs[i].tax;
        }
        break;
    }
    var childPriceArr = passengs.filter(v=>v.passenger_type==1);
    for (var i = 0; i < childPriceArr.length; i++) {
      ticketChildPrice += childPriceArr[i].sale_price;
      taxes += childPriceArr[i].fee + passengs[i].tax;
      insurance_price += childPriceArr[i].insurance_count * 40;
      tmpBirthday = childPriceArr[i].birthday;
      tmpName = childPriceArr[i].passenger_name;
      if (i + 1 < childPriceArr.length && tmpBirthday == childPriceArr[i + 1].birthday && tmpName == childPriceArr[i + 1].passenger_name) {
          childPrice += childPriceArr[i + 1].sale_price;
          taxes += childPriceArr[i + 1].fee + passengs[i].tax;
      }
      break;
    }
    for (var i = 0; i < passengs.length; i++) {
      if (passengs[i].passenger_type == "0")
      {
        adultCount++;
      }
      else if (passengs[i].passenger_type == "1")
      {
        childCount++;
      }
      else if (passengs[i].passenger_type == "2") {
        babyCount++;
      }
    }
    adultCount = adultCount / order.airticketOrder.FlightInfos.length;;
    childCount = childCount / order.airticketOrder.FlightInfos.length;;
    babyCount = babyCount / order.airticketOrder.FlightInfos.length;
    if (servers != null) {
      for (var i = 0; i < servers.length; i++) {
          servicePrice += parseInt(servers[i].pay_amount_due);
      }
    }
    passengs = this.filterByPassengerName(passengs);
    this.setData({
        price: Object.assign({}, price, {
            ticketAdultPrice,
            adultCount,
            ticketChildPrice,
            childCount,
            ticketBabyPrice,
            babyCount,
            insurance_price,
            delivery_price,
            taxes,
            refund,
            servicePrice,
        })
    });
  },
  //过滤
  filterByPassengerName(passengers){
    var obj = {};
    passengers = passengers.reduce((cur,next) => {
        obj[next.passenger_name] ? "" : obj[next.passenger_name] = true && cur.push(next);
        return cur;
    },[]);
    this.setData({
      passengers
    });
  },
  //初始化参数
  initData(options){
    var that = this;
    var orderId = options.orderId;
    that.setData({
      orderId: orderId,
    });
    this.loadOrderDetail();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData(options);
  },
//生成微信支付参数
createPayPara() {
  var that = this;
  var orderId = that.data.orderId
  if (orderId != null && orderId != "") {
      wx.showLoading({
          title: '数据加载中...',
      });
      httpRequst.HttpRequst(true, '/weixin/miniprogram/ashx/airTicket.ashx', { action: "createwxpaypara", orderId: this.data.orderId, openId: app.globalData.openId  } , "POST",function(res){
          wx.hideLoading()
          if (res.Success) {
              var parameObj = JSON.parse(res.Data);
              that.jsApiCall(parameObj, orderId);
          } else {
              wx.showToast({
                  title: '创建支付参数失败,请联系客服',
                  icon: 'none'
              });
          }
      });
  }
  },
  //调用微信JS api 支付
  jsApiCall(params, orderId) {
    var that = this;
    wx.requestPayment(
        {
        'timeStamp': params.timeStamp,
        'nonceStr': params.nonceStr,
        'package': params.package,
        'signType': params.signType,
        'paySign': params.paySign ,
        'success':function(res){
            if (res.errMsg == "requestPayment:ok") {
                that.payOrder(orderId);
            }else if (res.errMsg == "requestPayment:fail cancel") {
              wx.showToast({
                title: '支付失败!',
                icon: 'none'
              });
            }else {
                wx.showToast({
                    title: '支付失败!',
                    icon: 'none'
                });
            }
        },
        'fail':function(res){
            wx.showToast({
                title: '支付失败!',
                icon: 'none'
            });
        }
    });
  },
  //支付的订单
  payOrder(orderId){
  var that = this;
    wx.showLoading({
        title: '数据加载中...',
    });
    httpRequst.HttpRequst(true, '/weixin/jctnew/ashx/airTicket.ashx', { action: "pay", orderId: orderId, status: "1" }, "POST",function(res){
        wx.hideLoading()
        if (res.Success) {
            wx.showToast({
                title: res.Message || '支付成功',
                icon: 'none'
            });
        } else {
            wx.showToast({
                title: res.Message,
                icon: 'none'
            });
        }
    });
  },
  //倒计时
  countDown(){
    var that = this;
    var w = 104;
    var h = 104;
    var context1 = wx.createCanvasContext('countDown1');
    var context2 = wx.createCanvasContext('countDown2');
    wx.createSelectorQuery().select('#countDown1').boundingClientRect(function (rect) { //监听canvas的宽高
        w = parseInt(rect.width / 2); //获取canvas宽的的一半
        h = parseInt(rect.height / 2); //获取canvas高的一半，
    }).exec();            
    function drawInnerCircle() {    // 绘制固定内圈圆
      context1.arc(w, h, w - 8, 0, 2 * Math.PI, true);  // arc-创建一条弧线；参数-arc(圆心x坐标，圆心y坐标，圆半径，起始弧度，终止弧度，弧度方向是否是逆时针)
      context1.setLineWidth("14");     // setLineWidth-设置线条宽度；参数-setLineWidth(线条宽度，单位px)
      context1.setLineCap("butt");	//圆环结束断点的样式  butt为平直边缘 round为圆形线帽  square为正方形线帽
      context1.setStrokeStyle("#f7f7f7"); //圆环线条的颜色
      context1.stroke();            // stroke-画出当前路径的边框，默认颜色为黑色
      context1.restore();           // restore-恢复之前保存的绘图上下文
      context1.draw();    // draw-将之前在绘图上下文中的描述(路径，变形，样式)画到canvas中
    }
    function run(c, w, h) {  //c是圆环进度百分比   w，h是圆心的坐标
        let that = this;
        var num = (2 * Math.PI / 60 * c) - 0.5 * Math.PI;
        //圆环的绘制
        context2.arc(w, h, w - 8, -0.5 * Math.PI, num); //绘制的动作
        context2.setStrokeStyle("#ff0000"); //圆环线条的颜色
        context2.setLineWidth("10");	//圆环的粗细
        context2.setLineCap("butt");	//圆环结束断点的样式  butt为平直边缘 round为圆形线帽  square为正方形线帽
        context2.stroke();
        //开始绘制百分比数字
        context2.beginPath();
        context2.setFontSize(33); // 字体大小 注意不要加引号
        context2.setFillStyle("#000");	 // 字体颜色
        context2.setTextAlign("center");	 // 字体位置
        context2.setTextBaseline("middle");	 // 字体对齐方式
        context2.fillText(c , w, h);	 // 文字内容和文字坐标
        context2.draw();
    }
    countDownTimer =  setInterval( () => {
        var currentTime = 0;
        if(that.data.currentTime<=0){
            currentTime = 59
        }else{
            currentTime = that.data.currentTime-1;
        }
        that.setData({
            currentTime
        });
        drawInnerCircle();
        run(currentTime, w, h);
    }, 1000);
  },
  //取消订单
  bindCancelOrder: function () {
    var orderId = this.data.orderId;
    wx.showModal({
      title: '温馨提示',
      content: '您确定取消未完成支付的订单吗?',
      success: function (res) {
        if (res.confirm) {
          var memberId = app.globalData.memberId;
          var action = "cancelorder";
          var url = "/weixin/jctnew/ashx/airTicket.ashx"
          var params = {
            memberId: memberId,
            action: action,
            orderId: orderId
          }
          httpRequst.HttpRequst(true, url, params, 'POST', function (res) {
            if (res.Success) {
              wx.navigateTo({
                url: '../fwdd',
              })
            }else {
              wx.showToast({
                title: res.Message,
                icon: 'none'
              })
            }
          });
        } 
      }
    })
  },
  //再来一单
  bindReturnIndex: function () {
    wx.reLaunch({
      url: '../../../index/index'
    })
  },
  //申请退款
  bindApplyRefund: function () {
    var orderId = this.data.orderId;
    wx.showModal({
      title: '温馨提示',
      content: '您确定要申请退款?审核通过后退款金额将会在1至3个工作日退还至您账户。',
      success: function (res) {
        if (res.confirm) {
          var memberId = app.globalData.memberId;
          var action = "refund";
          var url = "/weixin/jctnew/ashx/airTicket.ashx"
          var params = {
            memberId: memberId,
            action: action,
            orderId: orderId
          }
          httpRequst.HttpRequst(true, url, params, 'POST', function (res) {
            if (res.Success) {
              wx.navigateTo({
                url: '../fwdd',
              })
            }else {
              wx.showToast({
                title: res.Message,
                icon: 'none'
              })
            }
          });
        } 
      }
    })
  },
  //跳转订单详情
  toOrderManager(){
    wx.navigateTo({
        url: '../jpdd'
    });
},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(countDownTimer);
    clearInterval(orderConfirmeTimer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(countDownTimer);
    clearInterval(orderConfirmeTimer);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})