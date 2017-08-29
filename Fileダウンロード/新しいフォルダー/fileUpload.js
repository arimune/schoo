   'use strict';
/**
 * １．attachmentIdを発行する
 * ２．inputを作成し、ファイル名とattachmentIdを持たせる。
 * ３．ファイル送信
 */
function addFile(files,displayFileName,CommunicationSuccess) {

  var maxLength = files.length;
  var dtos = [];
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if ($('#attachments_fields').children().length < 10) {
      var attachmentId = addFile.nextAttachmentId++;
      // TODO【共通部品候補】fileSpanとhidden
      var fileSpan=createFileSpan(attachmentId,file);
      fileSpan.appendTo('#attachments_fields');
      // メモ addInputFiles()の第一引数の関数を呼びだす
      displayFileName(attachmentId,file);

        // TODO【共通部品候補】 アップロード処理開始
        ajaxUpload(file, attachmentId, fileSpan, i, maxLength, dtos,CommunicationSuccess);
    }
  }
  return true;
}
addFile.nextAttachmentId = 1;

function createFileSpan(attachmentId,file){
  var fileSpan;
  fileSpan=$('<span>', {
    id: 'attachments_' + attachmentId
  });
  fileSpan.append($('<input>', {
    type: 'hideen',
    name: 'attachments[' + attachmentId + ']'
  }).val(file.name))
  ;
  return fileSpan;
}

function createLink(attachmentId,file) {
  var fileSpan;
  // 新たに<span>を生成
  fileSpan=$('<span>', {
    id: 'fileId_' + attachmentId
  });
  // 画面の<span id="fileId">に新たに<span>を追加
  $('#fileId').append(fileSpan);
  // fileSpanに生成した<div>と<a>削除</a>を追加している。
  fileSpan.append($('<div>'+ file.name + '</div>'), $('<a>削除</a>').attr({
    href: '#',
    'class': 'remove-upload dellink_ '+attachmentId
  }).click(removeLink).data('dellink',attachmentId));
}

function removeLink(){
  $(this).parent('span').remove();
  removeFile($(this).data('dellink'));
  return false;
}


// アップロード処理の関数
function ajaxUpload(file, attachmentId, fileSpan, nowIndex, maxLength, dtos,CommunicationSuccess) {

      // 【共通部品候補】
      // ファイル読込用クラスをインスタンス化
      var fr = new FileReader();
      fr.readAsDataURL(file);
      fr.onload = function(evt) {
        // 送信データ定義
        var dto = {
          name: '',
          testfile: '',
          attachmentId: '',
        };
        dto.name = file.name;
        dto.attachmentId = attachmentId;
        // ファイル本体（BASE64）
        dto.testfile = evt.target.result;
        // ヘッダー付きでBase64変換されているため、それを除去してDtoにセットする
        dto.testfile = dto.testfile.substr(dto.testfile.indexOf("base64,") + "base64,".length);

        // コールバック関数
        var callback = function(successFlg, data, textStatus, jqXHR) {
          if (successFlg) {
            // 成功時処理はここに記載する
            for (var i = 0; i < data.length; i++) {
            // メモ addInputFiles()の第二引数の関数を呼びだす
              //TODO 入れ元のメンバ変数名を変更 number⇒attachmentId
              CommunicationSuccess(data[i].attachmentId);
            }
          } else {
            // 失敗時（中断含む）処理はここに記載する
          }
        };
        dtos[nowIndex] = dto;
        // 送信処理
        if (nowIndex >= maxLength - 1) {
        var jqxhr = ajax_post_ToRestController('/rest/ajax/fileUploadTest',dtos, callback);
        }
      };

    }
function displayLink(attachmentId) {
  $('a.dellink_' + attachmentId).css('display', 'inline-block');
}


ajaxUpload.uploading = 0;

// 確定【共通側の関数】削除
function removeFile(attachmentId) {
  $('#attachments_' + attachmentId).remove();
}



// 【1番目】 JSPで呼ばれる最初のonchengeイベント
// displayFileNameはonchange="addInputFiles(createLink);"
  function addInputFiles(inputEl,displayFileName,CommunicationSuccess) {
if (inputEl.files) {

  // クローン作成 参照の部分
  var clearedFileInput = $('.file_selector').clone().val('');

  // ファイルの存在チェック
  // if (this.files) {
  //   var files=this.files;
  //   var maxFileSize = $(this).data('max-file-size');
  //   var checkFlag;
  //   var filesSize = fileSizeSum(files, maxFileSize);
  //   var sizeExceeded = fileSizecheck(filesSize);
    // 下準備&ファイル送信
    addFile(inputEl.files,displayFileName,CommunicationSuccess);
    // 「ファイル選択をするタグ」を削除
    $(inputEl).remove();
    // #mejisursiタグの下に参照のタブを再度置く。（元下あるやつはあとでremoveする）
    clearedFileInput.insertAfter('#mejisursi');
  }
}


function handleFileDropEvent(e) {

  $(this).removeClass('fileover');
  blockEventPropagation(e);

  if ($.inArray('Files', e.dataTransfer.types) > -1) {
    uploadAndAttachFiles(e.dataTransfer.files, $('input:file.file_selector'));
  }
}

function dragOverHandler(e) {
  $(this).addClass('fileover');
  blockEventPropagation(e);
}

function dragOutHandler(e) {
  $(this).removeClass('fileover');
  blockEventPropagation(e);
}

function setupFileDrop() {
  if (window.File && window.FileList && window.ProgressEvent && window.FormData) {

    $.event.fixHooks.drop = {
      props: ['dataTransfer']
    };

    $('form div.box').has('input:file').each(function() {
      $(this).on({
        dragover: dragOverHandler,
        dragleave: dragOutHandler,
        drop: handleFileDropEvent
      });
    });
  }
}

$(document).ready(setupFileDrop);
