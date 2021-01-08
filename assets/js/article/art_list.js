$(function () {
    // console.dir($('body')[0]);

    var layer = layui.layer
    var form = layui.form
    var q = {
        pagenum: 1, // 页码值，默认请求第一页的数据
        pagesize: 2, // 每页显示几条数据，默认每页显示2条
        cate_id: '', // 文章分类的 Id
        state: '' // 文章的发布状态
    }

    template.defaults.imports.dataFormat = function (date) {
        const dt = new Date(date)
        let y = dt.getFullYear();
        let m = addZero(dt.getMonth() + 1);
        let d = addZero(dt.getDate());

        let hh = addZero(dt.getHours());
        let mm = addZero(dt.getMinutes());
        let ss = addZero(dt.getSeconds());
        return y + "-" + m + "-" + d + "-" + hh + ":" + mm + ":" + ss;
    }



    function addZero(date) {
        return date <= 9 ? "0" + date : date
    }

    initTable()

    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function (res) {
                console.log(res);
                if (res.status !== 0) return layer.msg('获取文章列表失败！')

                // 使用模板引擎渲染页面的数据
                var htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr)

                renderPage(res.total)
            }
        })
    }

    $("#form-search").on("submit", function (e) {
        e.preventDefault();
        var cate_id = $("[name=cate_id]").val();
        var state = $("[name=state]").val();
        q.cate_id = cate_id;
        q.state = state;
        initTable()
    })


    // 初始化文章分类的方法
    function initCate(resid) {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) return layer.msg('获取分类数据失败！')

                // 调用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res)

                $('[name=cate_id]').html(htmlStr)
                $.each(res.data, function (index, item) {

                    $('#abc').append(new Option(item.name, item.Id))
                    $('#abc').val(resid)

                })
                // 通过 layui 重新渲染表单区域的UI结构

                form.render()
            }
        })
    }

    //   分页
    function renderPage(total) {
        var laypage = layui.laypage;

        //执行一个laypage实例
        laypage.render({
            elem: 'pageBox', //注意，这里的 test1 是 ID，不用加 # 号
            count: total, //数据总数，从服务端得到
            limit: q.pagesize, // 每页显示几条数据
            curr: q.pagenum, // 设置默认被选中的分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],
            jump: function (obj, first) {
                q.pagenum = obj.curr
                // 把最新的条目数，赋值到 q 这个查询参数对象的 pagesize 属性中
                q.pagesize = obj.limit
                if (!first) {
                    initTable()
                }
            }
        });
    }

    $("body").on("click", ".btn-delete", function () {
        var leg = $(".btn-delete").length
        console.log(leg);
        var id = $(this).attr("data-Id")
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function (index) {
            $.ajax(
                {
                    method: "GET",
                    url: "/my/article/delete/" + id,
                    success: function (res) {
                        console.log(res);
                        if (res.status !== 0) return layer.msg("删除失败")
                        if (leg === 1) {
                            q.pagenum = q.pagenum == 1 ? 1 : q.pagenum - 1
                        }
                        initTable()
                    }
                }
            )
            layer.close(index);
        });
    })







    $("body").on("click", ".btn-edit", function () {

        // 初始化富文本编辑器


        var edit_id = $(this).attr("data-Id")
        console.log(edit_id);

        $.ajax({
            method: 'GET',
            url: '/my/article/' + edit_id,
            success: function (res) {

                console.log(res.data);
                layer.open({
                    type: 1,
                    title: '编辑文章',
                    area: '70%',
                    anim: 1,
                    content: $("#tpl-edits").html(),
                    // content: strHTML,
                });
                // $('[name=title]').val('1233')
                form.val("form-pub", res.data)
                $("#image").attr("src", "http://api-breakingnews-web.itheima.net" + res.data.cover_img)
                console.log(res.data.cate_id);
                initCate(res.data.cate_id)
                initEditor()
                initImage()

                // $(`#id${res.data.cate_id}`).prop("selected",true)
                // $('#abc option').eq(2).prop("selected",true)


                form.render()

                // 1. 初始化图片裁剪器
                var $image = $('#image')

                // 2. 裁剪选项
                var options = {
                    aspectRatio: 400 / 280,
                    preview: '.img-preview'
                }

                // 3. 初始化裁剪区域
                $image.cropper(options)

                // 为选择封面的按钮，绑定点击事件处理函数
                $("body").on("click", "#btnChooseImage", function () {
                    $("#coverFile").click();
                })

                // 2.利用模板引擎 设置隐藏域填充内容
                //   var strHTML = template("tpl-edits",res)
                // console.log(strHTML);

                // 监听 coverFile 的 change 事件，获取用户选择的文件列表
                // 监听 coverFile 的 change 事件，获取用户选择的文件列表
                $('#coverFile').on('change', function (e) {

                    // 获取到文件的列表数组
                    var files = e.target.files
                    // 判断用户是否选择了文件
                    if (files.length === 0) {
                        return
                    }
                    // 根据文件，创建对应的 URL 地址
                    var newImgURL = URL.createObjectURL(files[0])
                    console.log(newImgURL);
                    // 为裁剪区域重新设置图片
                    $image
                        .cropper('destroy') // 销毁旧的裁剪区域
                        .attr('src', newImgURL) // 重新设置图片路径
                        .cropper(options) // 重新初始化裁剪区域
                })
                // 定义文章的发布状态
                var art_state = '已发布'

                // 为存为草稿按钮，绑定点击事件处理函数
                $('#btnSave2').on('click', function () {
                    art_state = '草稿'
                })

                function publishArticle(fd) {
                    $.ajax({
                        method: 'POST',
                        url: '/my/article/edit',
                        data: fd,
                        // 注意：如果向服务器提交的是 FormData 格式的数据，
                        // 必须添加以下两个配置项
                        contentType: false,
                        processData: false,
                        success: function (res) {
                            if (res.status !== 0) {
                                return layer.msg('发布文章失败！')
                            }
                            layer.msg('发布文章成功！')
                            // 发布文章成功后，跳转到文章列表页面
                            location.href = '/article/art_list.html'
                        }
                    })
                }

                // 为表单绑定 submit 提交事件
                $('#form-pub').on('submit', function (e) {
                    // 1. 阻止表单的默认提交行为
                    e.preventDefault()
                    // 2. 基于 form 表单，快速创建一个 FormData 对象
                    var fd = new FormData($(this)[0])
                    // 3. 将文章的发布状态，存到 fd 中
                    fd.append('state', art_state)
                    // 4. 将封面裁剪过后的图片，输出为一个文件对象
                    $image
                        .cropper('getCroppedCanvas', {
                            // 创建一个 Canvas 画布
                            width: 400,
                            height: 280
                        })
                        .toBlob(function (blob) {
                            // 将 Canvas 画布上的内容，转化为文件对象
                            // 得到文件对象后，进行后续的操作
                            // 5. 将文件对象，存储到 fd 中
                            fd.append('cover_img', blob)
                            // 6. 发起 ajax 数据请求

                            publishArticle(fd)
                        })
                })
            }
        })



    })



    // 3.修改完毕发送ajax请求刷新数据
    function initImage() {
        // 1. 初始化图片裁剪器
        var $image = $('#image')

        // 2. 裁剪选项
        var options = {
            aspectRatio: 400 / 280,
            preview: '.img-preview'
        }

        // 3. 初始化裁剪区域
        $image.cropper(options)
    }

})