var should = require('should');

var token = process.env.WX_TOKEN || 'keyboardcat123';
var port = process.env.PORT || 3000;

var bootstrap = require('./bootstrap.js');
var makeRequest = bootstrap.makeRequest;
var sendRequest = makeRequest('http://localhost:' + port, token);

var app = require('../app.js');

//公用检测指令
var detect = function(info, err, json, content){
  should.exist(info);
  should.not.exist(err);
  should.exist(json);
  json.should.be.a('object');
  if(content){
    json.should.have.property('Content');
    json.Content.should.match(content);
  }
};

//测试规则
describe('Rule', function(){
  //初始化
  var info = null;
  beforeEach(function(){
    info = {
      sp: 'webot',
      user: 'client',
      type: 'text'
    };
  });

  //测试dialog消息
  describe('dialog', function(){
    //检测key指令
    it('should return key msg', function(done){
      info.text = 'key aaaa';
      sendRequest(info, function(err, json){
        detect(info, err, json, /aaaa/);
        json.Content.should.not.match(/太笨了/);
        done();
      });
    });

    //检测yaml指令
    it('should return yaml msg', function(done){
      info.text = 'yaml';
      sendRequest(info, function(err, json){
        detect(info, err, json, /这是一个yaml的object配置/);
        done();
      });
    });
  });

  //测试wait
  describe('wait', function(){
    //检测search指令
    it('should return search msg', function(done){
      info.text = 's javascript';
      sendRequest(info, function(err, json){
        detect(info, err, json, /百度搜索.*javascript/);
        done();
      });
    });
  });

  //测试地理位置
  describe('location', function(){
    //检测check_location指令
    it('should return check_location msg', function(done){
      info.type = 'location';
      info.xPos = '23.08';
      info.yPos = '113.24';
      info.scale = '12';
      info.label = '广州市 某某地点';
      sendRequest(info, function(err, json){
        detect(info, err, json, /广州/);
        done();
      });
    });
  });

  //测试图文消息
  describe('news', function(){
    //检测首次收听指令
    it('should return subscribe message.', function(done){
      info.type = 'event';
      info.event = 'subscribe';
      info.eventKey = '';
      sendRequest(info, function(err, json){
        detect(info, err, json);
        json.should.have.property('MsgType', 'news');
        json.should.have.property('FuncFlag', 0);
        json.Articles.item.should.have.length(json.ArticleCount);
        json.Articles.item[0].Title[0].toString().should.match(/感谢你收听/);
        done();
      });
    });

    //检测image指令
    it('should return news msg', function(done){
      info.type = 'text';
      info.text = 'news';
      sendRequest(info, function(err, json){
        detect(info, err, json);
        json.should.have.property('MsgType', 'news');
        json.should.have.property('FuncFlag', 0);
        json.Articles.item.should.have.length(json.ArticleCount);
        json.Articles.item[0].Title[0].toString().should.match(/微信机器人/);
        done();
      });
    });
  });

  describe('fallback', function(){
    it('should add funcflag', function(done){
      info.type = 'text';
      info.text = '乱麻乱麻乱麻';
      sendRequest(info, function(err, json){
        detect(info, err, json);
        json.should.have.property('FuncFlag', 1);
        done();
      });
    });
  });
});
