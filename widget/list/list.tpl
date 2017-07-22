<div class="list">
    <div class="item" v-for="item in list" @click="getDetailInfo">
        <!-- 这个图片展示用瀑布流的话，保证不了排名 -->
        <!-- 按照排名的话，图片可能会有缩放 -->
        <div class="itemImg">
            <img src="../../static/img/default.jpg" />
        </div>
        <div class="itemDesc">
            <span class="name">{{item.course_name}}</span>
            <span class="doVote">投票</span>
        </div>
    </div>
</div>