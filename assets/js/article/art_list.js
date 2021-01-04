$(function () {
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

    initCate()
    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) return layer.msg('获取分类数据失败！')

                // 调用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res)
                $('[name=cate_id]').html(htmlStr)
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

   




})