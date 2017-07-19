import Vue from 'vue';
import axios from 'axios';
Vue.prototype.$axios = axios;
import './list.less';
const app = new Vue({
    el: '#list',
    template: __inline('./list.tpl'), // 公共的模板
    components: {
    },
    data() {
        return {
            list: [1, 2, 3]
        }
    },
    created() {
        // 设置axios的访问host

        /*<prod>*/
        axios.defaults.baseURL = '//classroom.speiyou.com';
        /*</prod>*/
        
        /*<debug>*/
        axios.defaults.baseURL = '//ceshi.api.haibian.com';
        /*</debug>*/

        /*<test>*/
        axios.defaults.baseURL = '//ceshi.api.haibian.com';
        /*</test>*/

        // axios.defaults.withCredentials = 'include' //加了这段就可以跨域带cookie
        Vue.prototype.$axios = axios;
        this.$axios.get('/studentapp/studyingcourseforipad', {
            params: {
                user_id: '325370'
            }
        }).then((res) => {
            if (res.status == 200) {
                // ajax success
                let result = res.data;
                if (result.error_no == 0) {
                    // success
                    this.list = result.result;
                }
            }
        })
    },
    mounted() {
        
    }
})
