import * as echarts from '../../ec-canvas/echarts';//导入echarts
//index.js
//获取应用实例
const app = getApp()
var hours_chart = null

Page({
  data: {
    ec: {
      
      onInit: function(canvas,width,height){
        hours_chart = echarts.init(canvas,null,{
          width:width,
          height:height
        });
        canvas.setChart(hours_chart);
        return hours_chart;
      }
    }
  },
  onLoad: function () {
    console.log('onLoad');
    var that  = this;
    that.getLocation();
  },
  getLocation:function(){
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      altitude: true,
      success: function(res) {
        var lat = res.latitude;
        var lng = res.longitude;
        that.getCity(lat,lng);
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  getCity:function(lat,lng){
    var that = this;
    var url = "https://api.map.baidu.com/geocoder/v2/"
    var params = {
      ak:"gyvc9Geiso6S3KZcOVGdbop9qDrg5iHl",
      output:"json",
      location:lat+","+lng
    };

    wx.request({
      url: url,
      data: params,
      success: function(res){
        var city = res.data.result.addressComponent.city;
        var district = res.data.result.addressComponent.district;
        
        var loc = city+district;
        //console.log(loc);
        that.setData({city:loc})

        that.getWeather(city);
      }
    })
  },
  getWeather:function(city){
    var that = this;
    var url = "https://free-api.heweather.com/s6/weather";
    var parameters = {
      location: city,
      key: "a6b8faa2d72e49e9a564370ff6423755"
    }
    wx.request({
      url: url,
      data: parameters,
      success: function(res){
        var data = res.data.HeWeather6[0];
        that.setHoursChartData(data.daily_forecast);
        that.setData({
          temp: data.now.tmp,
          type: data.now.cond_txt,
          date: data.update.loc,
          humidity: data.now.hum,
          sunrise: data.daily_forecast[0].sr,
          sunset: data.daily_forecast[0].ss,
          wind_dir: data.daily_forecast[0].wind_dir,
          wind_level: data.daily_forecast[0].wind_sc,
          cloud: data.now.cloud,
          type_img_url: "https://cdn.heweather.com/cond_icon/"+data.now.cond_code+".png"
        })
      }
    })
  },
  setHoursChartData: function(data){
    var high = [];
    var low = [];
    for(var i in data){
      high.push(data[i].tmp_max);
      low.push(data[i].tmp_min);
    }
    var option = {
    title: {
      text: '气温预报',
      left: 'center'
    },
    legend: {
      data: ['高温','低温'],
      top: 50,
      left: 'center',
      z: 100
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['一', '二', '三'],
      // show: false
    },
    yAxis: {
      x: 'center',
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
      // show: false
    },
    series: [{
      name: '高温',
      type: 'line',
      smooth: true,
      data: high,
    },
      {
        name: '低温',
        type: 'line',
        smooth: true,
        data: low,
      }]
  };
  hours_chart.setOption(option);
  }
})
