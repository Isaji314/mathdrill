//update functions for new html radio/sum/etc...
function clearSettings(){
  $('#apple').removeClass('d-none');
  $('#carrot').addClass('d-none');
  $('#banana').addClass('d-none');

  //$('#addition').prop('checked',true);
  //$('#subtraction').prop('checked',true);
  $('#typeAddSub1').prop('checked',true);
  $('[name=typeAddSub]').change();
  $('#randomAddSub').prop('checked',true);
  $('#asta1').val(1);
  $('#asta2').val(3);
  $('#astb1').val(1);
  $('#astb2').val(3);
  $('#asSum').val(10);

  //$('#multiplication').prop('checked',true);
  //$('#division').prop('checked',true);
  $('#randomMultDiv').prop('checked',true);
  $('#mdta1').val(1);
  $('#mdta2').val(3);
  $('#mdtb1').val(1);
  $('#mdtb2').val(3);
}

function start(){
  config.init();
  if(valid()){
    setupDrill();
  } else {
    $('#errorMessage').removeClass('d-none').html(config.errorMessage);
  }
}

function valid(){
  var isValid = true;
  config.errorMessage = '';
  $('#errorMessage').addClass('d-none').html('');
  //check at least one operator is selected
  if(config.isAdd || config.isSub || config.isMult || config.isDiv){
    //check settings for all selected operators
    if(config.isAdd || config.isSub){
      if(config.ASwhich == 'range'){
        if(!Number.isInteger(config.a1) || !Number.isInteger(config.a2) || !Number.isInteger(config.b1) || !Number.isInteger(config.b2)){
          config.errorMessage += "Range values must be Integers.<br/>";
          isValid = false;
        }
      } else {
        if(!Number.isInteger(config.assum)){
          config.errorMessage += "Sum value must be an Integer.<br/>";
          isValid = false;
        }
      }
    }

    if(config.isMult || config.isDiv){
      if(!Number.isInteger(config.c1) || !Number.isInteger(config.c2) || !Number.isInteger(config.d1) || !Number.isInteger(config.d2)){
        config.errorMessage += "Range values must be Integers.<br/>";
        isValid = false;
      }
    }

    return true;
  } {
    config.errorMessage = 'Must select at least 1 operation.<br/>';
  }
  return false;
}

function setupDrill(){
  $('#apple').addClass('d-none');
  $('#carrot').addClass('d-none');
  $('#banana').removeClass('d-none');
  config.setup();
  $('#answer').focus();
}

function showFinal(){
  $('#apple').addClass('d-none');
  $('#carrot').removeClass('d-none');
  $('#banana').addClass('d-none');
  config.showReport();
}

var config = {};
config.diff = function(a,b){
  if(a>b)
    return a-b;
  return b-a;
}
config.getRandom = function(s,r){
  if(r==0) return s;
  return s + Math.floor(Math.random() * r);
}
config.tickDown = function(){
  this.timeRemaining--;
  $('#timeLeft').html(this.timeRemaining);
  if(this.timeRemaining <= 0){
    clearInterval(this.timer);
    showFinal();
  }
}
config.init = function(){
  this.isAdd = $('#addition:checked').length == 1;
  this.isSub = $('#subtraction:checked').length == 1;
  this.ASwhich = $('[name=typeAddSub]:checked').val();
  if(this.ASwhich == 'range'){
    this.isRandomAddSub = $('#randomAddSub:checked').length == 1;
    this.a1 = parseInt($('#asta1').val(), 10);
    this.a2 = parseInt($('#asta2').val(), 10);
    this.ar = this.diff(this.a1, this.a2)+1;
    this.b1 = parseInt($('#astb1').val(), 10);
    this.b2 = parseInt($('#astb2').val(), 10);
    this.br = this.diff(this.b1, this.b2)+1;
  } else if(this.ASwhich == 'sum'){
    this.assum = parseInt($('#asSum').val(), 10);
  }

  this.isMult = $('#multiplication:checked').length == 1;
  this.isDiv = $('#division:checked').length == 1;
  this.isRandomMultDiv = $('#randomMultDiv:checked').length == 1;
  this.c1 = parseInt($('#mdta1').val(),10);
  this.c2 = parseInt($('#mdta2').val(),10);
  this.cr = this.diff(this.c1, this.c2)+1;
  this.d1 = parseInt($('#mdtb1').val(),10);
  this.d2 = parseInt($('#mdtb2').val(),10);
  this.dr = this.diff(this.d1, this.d2)+1;

  this.duration = $('#duration option:selected').val();
}
config.setup = function(){
  this.timeRemaining = this.duration;
  $('#timeLeft').html(this.timeRemaining);
  this.score = 0;
  $('#score').html(this.score);
  this.operations = [];
  if(this.isAdd) this.operations.push("a");
  if(this.isSub) this.operations.push("s");
  if(this.isMult) this.operations.push("m");
  if(this.isDiv) this.operations.push("d");
  this.getQuestion();
  if(this.timer)
    clearInterval(this.timer);
  this.timer = setInterval(function(){config.tickDown()}, 1000);
}

config.getQuestion = function(){
  var past = {};
  past.type = this.type;
  past.values = this.values;
  this.type = this.operations[this.getRandom(0,this.operations.length)];
  
  this.divZeroCount=0;
  do{
    if(this.type == 'a' || this.type == 's'){
      this.addSub(this.type);
    } else if(this.type == 'm' || this.type == 'd'){
      this.multDiv(this.type);
    }
    if(this.divZeroCount>5){
      config.reportErrorMessage = 'Too many divide by 0 encountered. Stopping early.';
      this.timeRemaining = 0;
      break;
    }
  }while(!config.validQuestion(past));
}
config.validQuestion = function(prev){
  //check if same question as previous question and check if trying to divide by 0
  if(!prev.type && !prev.values) return false;
  if(this.type == 'd' && this.values[0] == 0) return false;
  //console.log(this.type+'|'+this.values[0]+'|'+this.values[1]+'|'+this.values[2]+':'+prev.type+'|'+prev.values[0]+'|'+prev.values[1]+'|'+prev.values[2])
  if(this.type == prev.type){
    return this.values[2]==prev.values[2] 
          && this.values[1]==prev.values[1]
          && this.values[0]==prev.values[0];
  }
  return true;
}

config.addSub = function(type){
  var t = [];
  if(this.ASwhich == 'range'){
    var t1 = this.getRandom(Math.min(this.a1, this.a2),this.ar);
    var t2 = this.getRandom(Math.min(this.b1, this.b2),this.br);
    var i = this.isRandomAddSub?this.getRandom(0,2):0;
    t[i]=t1;
    t[(i+1)%2]=t2;
    t[2]=t1+t2;
  } else {
    var i = this.getRandom(0,2);
    t[2] = this.getRandom(0, this.assum);
    t[i] = this.getRandom(0, t[2]);
    t[(i+1)%2] = t[2] - t[i];
  }

  if(type=='a'){
    $('#question').html(t[0] + " + " + t[1]);
    this.answer = t[2];
  } else {
    $('#question').html(t[2] + " - " + t[0]);
    this.answer = t[1];
  }
  this.values=t;
}
config.multDiv = function(type){
  var t = [];
  var t1 = this.getRandom(Math.min(this.c1, this.c2),this.cr);
  var t2 = this.getRandom(Math.min(this.d1, this.d2),this.dr);
  var i = this.isRandomMultDiv?this.getRandom(0,2):0;
  t[i]=t1;
  t[(i+1)%2]=t2;
  t[2]=t1*t2;

  if(type=='m'){
    $('#question').html(t[0] + " &times; " + t[1]);
    this.answer = t[2];
  } else {
    $('#question').html(t[2] + "  &#247; " + t[0]);
    if(t[0] == 0)
      this.divZeroCount++;
    this.answer = t[1];
  }
  this.values=t;
}

config.checkAnswer = function(){
  var a = parseInt($('#answer').val(),10);
  if(a == this.answer){
    $('#answer').val('');
    this.getQuestion();
    this.score++;
    $('#score').html(this.score);
  }
}

config.showReport = function(){
  $('#carrot #score').html(this.score);
  $('#carrot #duration').html(this.duration);
  if(this.isAdd || this.isSub){
    $('#addSub #ops').html((this.isAdd && this.isSub)?'Add, Sub':this.isAdd?'Add':'Sub');
    if(this.ASwhich == 'range'){
      $('#AS_range').removeClass('d-none');
      $('#AS_sum').addClass('d-none');
      $('#addSub #ran').html(this.randomAddSub?'True':'False');
      $('#addSub #one').html(this.a1 + ' to ' + this.a2);
      $('#addSub #two').html(this.b1 + ' to ' + this.b2);
    } else {
      $('#AS_range').addClass('d-none');
      $('#AS_sum').removeClass('d-none');
      $('#addSub #sum').html(this.assum);
    }
    $('#addSub').removeClass('d-none');
  }
  if(this.isMult || this.isDiv){
    $('#multDiv #ops').html((this.isMult && this.isDiv)?'Mult, Div':this.isMult?'Mult':'Div');
    if(config.reportErrorMessage){
      $('#reportErrorMessage').removeClass('d-none').html(config.reportErrorMessage);
    }
    $('#multDiv #ran').html(this.randomMultDiv?'True':'False');
    $('#multDiv #one').html(this.c1 + ' to ' + this.c2);
    $('#multDiv #two').html(this.d1 + ' to ' + this.d2);
    $('#multDiv').removeClass('d-none');
  }
}

$(function(){
  clearSettings();
  $('#answer').keyup(function(){
    if(config.timeRemaining > 0)
      config.checkAnswer();
  });

  $('[name=typeAddSub]').change(function(){
    var selected = $('[name=typeAddSub]:checked').val();
    if(selected == 'range'){
      $('#rangeAddSub').removeClass('d-none');
      $('#sumAddSub').addClass('d-none');
    } else {
      $('#rangeAddSub').addClass('d-none');
      $('#sumAddSub').removeClass('d-none');
    }
  });

  $('[name=typeMultDiv]').change(function(){
    var selected = $('[name=typeMultDiv]:checked').val();
    if(selected == 'range'){
      $('#rangeMultDiv').removeClass('d-none');
      $('#sumMultDiv').addClass('d-none');
    } else {
      $('#rangeMultDiv').addClass('d-none');
      $('#sumMultDiv').removeClass('d-none');
    }
  });
});