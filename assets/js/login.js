$(function() {
  // 点击“去注册账号”的链接
  $('#link_login').on('click', function() {
   $('#form_res').hide()
    $('#form_login').show()
  })

  // 点击“去登录”的链接
  $('#link_reg').on('click', function() {
     $('#form_login').hide()
    $('#form_res').show()
  })
})
