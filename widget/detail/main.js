import Vue from 'vue';
import axios from 'axios';
Vue.prototype.$axios = axios;
import './detail.less';
const app = new Vue({
    el: '#detail',
    template: __inline('./detail.tpl'), // 公共的模板
    components: {
    },
    data() {
        return {
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
        
    },
    mounted() {
        
    },
    methods: {
        
    }
})
