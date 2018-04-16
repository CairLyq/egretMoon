class MButton extends moon.BasicButton {};
class MImage extends moon.Image{};
class ImageAnimation extends moon.ImageAnimation{};
class Layout extends moon.ImageLayout{};
class Scale9Image extends moon.Scale9Image{};
class MoonEvent extends moon.MoonEvent{};
class GameData extends moon.GameData{};
class Const extends moon.Const{};
module moon
{
    /**游戏模版 */
	export class BasicGamePanel extends moon.GameView
    {
        protected panelStart:BasicGameStart;
        protected panelOver:BasicGameOver;
        protected panelSet:BasicGameSet;
        protected score:number;//分数
        protected level:number;//等级
        protected blood:number;//血量
        protected txtScore:TextField;
        protected txtLevel:TextField;
        protected txtBlood:TextField;
        /**加载到舞台之后调用 */
        protected render():void
        {
            super.render();
            GameData.stageWidth=this.stageWidth;
            GameData.stageHeight=this.stageHeight;
            GameData.stage=this.stage;
            this.initView();
        }
        protected initView():void
        {
            this.createBgGradientFill();
            
            this.txtScore=this.createText();
            this.txtLevel=this.createText(200);
            this.txtBlood=this.createText(400);
            

            this.panelSet=new BasicGameSet;
            this.panelSet.setBtnPos(4,200);
            this.panelSet.addEvent(MoonEvent.PAUSE,this.onSetHandler,this);
            this.panelSet.addEvent(MoonEvent.PLAY,this.onSetHandler,this);
            this.panelSet.addEvent(MoonEvent.CHANGE,this.onSetHandler,this);
            this.addChild(this.panelSet);

            this.panelStart=new BasicGameStart;
            this.panelStart.addEvent(moon.MoonEvent.START,this.start,this)
            this.addChild(this.panelStart);

            this.panelOver=new BasicGameOver;
            this.panelOver.addEvent(moon.MoonEvent.START,this.start,this)

            

           

            this.initGame();
        }
        protected initGame():void
        {
            this.level=1;
            this.score=0;
            this.blood=200;
            this.updateBlood();
            this.updateLevel();
            this.updateScore();
        }
        protected start(e:moon.MoonEvent):void
        {
            this.initGame();
            this.play();
        }
        protected loop(n:number):boolean
        {
            this.blood--;
            this.score+=10;
            this.updateScore();
            this.updateBlood();
            return true;
        }
        protected over():void
        {
            this.addChild(this.panelOver);
            this.panelOver.alpha=0;
            Tween.get(this.panelOver).to({alpha:1},300)
            this.panelOver.update({score:this.score,level:this.level});
            this.stop();
        }
        protected updateLevel():void
        {
            this.txtLevel.text="level:"+this.level;
        }
        protected updateScore():void
        {
            this.txtScore.text="score:"+this.score;
            if(this.score>0&&this.score%200==0){
                this.level++;
                this.updateLevel();
            }
        }
        protected updateBlood():void
        {
            this.txtBlood.text="blood:"+this.blood;
            if(this.blood==0){
                this.over();
            }
        }
        protected onSetHandler(e:MoonEvent):void
        {
            if(e.type==MoonEvent.PAUSE){
                this.stop();
            }else if(e.type==MoonEvent.PLAY){
                this.play();
            }else{
                var value:number=e.data as number;
                if(e.dataType="soundBg"){

                }else if(e.dataType="soundEffect"){

                }
            }
        }
        protected createImageBg(name:string):void
        {
            this.addChild(new MImage(name));
        }
        public dispose():void
        {
            this.stop();
            super.dispose();
        }
    }
    /**游戏开始界面 */
    export class BasicGameStart extends moon.GameView
    {
        /**加载到舞台之后调用 */
        protected render():void
        {
            super.render();
            
            this.initView();
        }
        protected initView():void
        {
            var bg:Sprite=this.createBackground();
            bg.alpha=0.5;
            
            this.createBtn("开始游戏");
            this.createTitle("游戏标题");
        }
        protected createBtn(value:string):MButton
        {
            var btn:moon.BasicButton=this.createButton(value);
            btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onClick,this);
            btn.x=(this.stageWidth-btn.width)>>1;
            btn.y=(this.stageHeight-btn.height)>>1;
            return btn;
        }
        protected createTitle(value:string):TextField
        {
            var title:TextField=this.createText(0,0,value);
            title.x=(this.stageWidth-title.width)/2;
            title.y=(this.stageHeight-title.height)/2-100;
            return title;
        }
        protected onClick(e:egret.TouchEvent):void
        {
             this.dispEvent(MoonEvent.START);
             Tween.get(this).to({alpha:0},300).call(this.backCall,this)
        }
        protected backCall(e:egret.TouchEvent):void
        {
            this.removeFromParent();
        }
        protected createImageBg(name:string):void
        {
            this.addChild(new MImage(name));
        }
    }
    /**游戏结束界面 */
    export class BasicGameOver extends BasicGameStart
    {
        protected txtScore:TextField;
        protected txtLevel:TextField;
        protected rankPanel:BasicGameRank;
        protected initView():void
        {
            this.createBtn("再来一次");
            var btn:MButton=this.createBtn("排行榜");
            btn.y+=100;
            this.txtScore=this.createText();
            this.txtLevel=this.createText();

            this.rankPanel=new BasicGameRank;
        }
        public update(data:Object):void
        {
            this.txtScore.text="score:"+data["score"];
            this.txtLevel.text="level:"+data["level"];
            this.txtScore.x=(this.stageWidth-this.txtScore.width)/2;
            this.txtLevel.x=(this.stageWidth-this.txtLevel.width)/2;
            this.txtScore.y=(this.stageHeight-this.txtScore.height)/2-60;
            this.txtLevel.y=this.txtScore.y-60;
        }
        protected onClick(e:egret.TouchEvent):void
        {
            var btn:MButton=e.currentTarget as MButton;
            if(btn.label=="再来一次"){
                super.onClick(e);
            }else{
                GameData.stage.addChild(this.rankPanel);
            }
        }
    }
    /**游戏设置面板*/
    export class BasicGameSet extends moon.BasicView
    {
        protected btnSet:MButton;
        protected btnClose:MButton;
        protected container:Sprite;
        protected btnSoundBg:MoreSkinButton;
        protected btnSoundEffect:MoreSkinButton;
        protected btnSetPos:Point;
        public static SOUND_BG:string="sound bg";
        public static SOUND_EFFECT:string="sound effect";
        protected render():void
        {
            super.render();
            this.initView();
        }
        protected initView():void
        {
           var skin:Sprite=this.getSkin();
           //skin.filters=[new egret.GlowFilter(0)];
           this.btnSet=new MButton(skin,this.getSkin());
           this.btnSet.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onClick,this);
           this.addChild(this.btnSet);
           if(this.btnSetPos){
               this.btnSet.x=this.btnSetPos.x;
               this.btnSet.y=this.btnSetPos.y;
           }           

           this.container=new Sprite;
           var containerBg=this.createBackground(0,0.5);
           this.container.addChild(containerBg);

           var setbg:MoonDisplayObject=new MoonDisplayObject;
           var bgWidth:number=this.stageWidth>>1;
           var colorBg:number=0XFF9900;
           setbg.type=Const.SHAPE_RECT_ROUND;
           setbg.data={w:bgWidth*1.1,h:bgWidth,ew:100,eh:100,c:colorBg};
           setbg.setBackground(0XFFFFFF,5);
           setbg.x=(containerBg.width-bgWidth)>>1;
           setbg.y=(containerBg.height-bgWidth)>>1;
           this.container.addChild(setbg);

           var label1:Label=new Label("背景音乐",0XFFFFFF);
           var label2:Label=new Label("游戏音效",0XFFFFFF);
           label1.textField.size=40;
           label2.textField.size=40;
           label1.x=label2.x=50;
           label1.y=50;label2.y=150;
           setbg.addChild(label1);
           setbg.addChild(label2);

           var btn=this.getToggleSwitch();
           btn.x=label1.x+label1.width+10;
           btn.y=label1.y-5;
           setbg.addChild(btn);
           this.btnSoundBg=btn;

           var btn=this.getToggleSwitch();
           btn.x=label2.x+label2.width+10;
           btn.y=label2.y-5;
           setbg.addChild(btn);
           this.btnSoundEffect=btn;

           var button:MButton=new MButton();
           button.label="关  闭";
           button.x=(setbg.width-button.width)>>1;
           button.y=240;
           button.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onClick,this);
           setbg.addChild(button);
           this.btnClose=button;

        }
        /**设置 */
        public setBtnPos(x:number=0,y:number=0):void{
            this.btnSetPos=new Point(x,y)
        }
        protected getSkin():Sprite
        {
            var colorBg:number=0XFF9900;
            var colorIcon:number=0X6A4000;
            var container:Sprite=new Sprite;
            var bgWidth:number=90;
            var bg:MoonDisplayObject=new MoonDisplayObject;
            bg.type=Const.SHAPE_RECT_ROUND;
            bg.data={w:bgWidth,h:bgWidth,ew:30,eh:30,c:colorBg};
            bg.anchorOffsetX=bg.anchorOffsetY=bgWidth>>1;
            container.addChild(bg);
            container.addChild(MoonUI.getCircle(30,colorIcon));
            var len:number=8;
            var rotation:number=360/len;
            for(var i:number=0;i<len;i++){
                var line:Sprite=MoonUI.getRect(15,80,colorIcon);
                line.anchorOffsetX=line.width>>1;
                line.anchorOffsetY=line.height>>1;
                line.rotation=rotation*i;
                container.addChild(line);
            }
            container.addChild(MoonUI.getCircle(20,colorBg));
            container.addChild(MoonUI.getCircle(6,colorIcon));
            container.anchorOffsetX=container.anchorOffsetY=-(bgWidth/2+4);
            return container;
        }
        protected getToggleSwitch():MoreSkinButton
        {
            var normal:Sprite=moon.Skin.switchOn;
            var down:Sprite=moon.Skin.switchOn;
            var normal2:Sprite=moon.MoonUI.getSwitch(moon.Color.bule,moon.Color.white)
            var down2:Sprite=moon.MoonUI.getSwitch(moon.Color.red,moon.Color.white)
            var btn:MoreSkinButton=new MoreSkinButton([normal,down,normal2,down2]);
            btn.toggleSwitch=true;
            btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onClick,this);
            return btn;
        }
        protected onClick(e:egret.TouchEvent):void
        {
            var btn:MButton=e.currentTarget as MButton;
            var value:number;
            if(btn==this.btnSet){
                this.addChild(this.container);
                this.setValue();
                this.dispEvent(MoonEvent.PAUSE);
            }else if(btn==this.btnSoundBg){
                value=this.btnSoundBg.currentPage;
                alertAuto("背景音乐"+(value==1?"开":"关"),1);
                BasicGameStorage.localWrite(BasicGameSet.SOUND_BG,value.toString());
                this.dispEvent(MoonEvent.CHANGE,this.btnSoundBg.currentPage,"soundBg");
            }else if(btn==this.btnSoundEffect){
                value=this.btnSoundEffect.currentPage;
                alertAuto("游戏音效"+(value==1?"开":"关"),1);
                BasicGameStorage.localWrite(BasicGameSet.SOUND_EFFECT,value.toString());
                this.dispEvent(MoonEvent.CHANGE,this.btnSoundEffect.currentPage,"soundEffect");
            }else if(btn==this.btnClose){
                this.removeChild(this.container);
                this.dispEvent(MoonEvent.PLAY);
            }
        }
        protected setValue():void
        {
           var value:string=BasicGameStorage.localRead(BasicGameSet.SOUND_BG)||"1";
           this.btnSoundBg.updatePage(parseInt(value));

           var value:string=BasicGameStorage.localRead(BasicGameSet.SOUND_EFFECT)||"1";
           this.btnSoundEffect.updatePage(parseInt(value));
        }
    }
        /**游戏积分排行板*/
    export class BasicGameRank extends moon.BasicView
    {
        private txtRank:TextField;
        private items:RankItem[]=[];
        private conatiner:Sprite;
        protected render():void
        {
            super.render();
            this.initView();
        }
        protected initView():void
        {
           this.createBackground(0,0.5);
           var rankBg=MoonUI.getRect(this.stageWidth-100,this.stageHeight-200,0);
           rankBg.alpha=0.8;
           this.addChild(rankBg);
           Layout.getIns().setCenterXByPanent(rankBg);
           Layout.getIns().setCenterYByPanent(rankBg);
           var rect:Rectangle=new Rectangle(rankBg.x,rankBg.y,rankBg.width,rankBg.height);
           var dis:number=60;
           var line:Sprite=new Sprite;
           line.graphics.lineStyle(2,0XFFFFFF);
           line.graphics.moveTo(rect.x,rect.y+dis);
           line.graphics.lineTo(rect.x,rect.y);
           line.graphics.lineTo(rect.right,rect.y);
           line.graphics.lineTo(rect.right,rect.bottom);
           line.graphics.lineTo(rect.x,rect.bottom);
           line.graphics.lineTo(rect.x,rect.y+dis);
           line.graphics.lineTo(rect.right,rect.y+dis);
           this.addChild(line);

           var xnum:number=30;
           var btnSkin=MoonUI.getCircle(xnum,0xffffff);
           var skinX=MoonUI.getX(xnum>>1,xnum>>1,0x00ff00,4);
           skinX.anchorOffsetX=skinX.anchorOffsetY=xnum>>2;
           btnSkin.addChild(skinX);

           var btn:MButton=new MButton(btnSkin,btnSkin);
           btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onClick,this);
           this.addChild(btn);
           btn.x=rankBg.x+rankBg.width;
           btn.y=rankBg.y;

           var txt:TextField=this.createText(0,0,"分数排行榜");
           Layout.getIns().setCenterXByPanent(txt);
           txt.y=rankBg.y+(dis-txt.height)/2;
           this.addChild(txt);

           var txt:TextField=this.createText(rankBg.x,rankBg.y+dis);
           this.addChild(txt);
           this.txtRank=txt;

           this.conatiner=new Sprite;
           this.addChild(this.conatiner);
           var itemw:number=rankBg.width-2
           for(var i=0;i<50;i++){
                var item:RankItem=new RankItem(itemw,i);
                this.conatiner.addChild(item);
                this.items.push(item);
           }
           SimpleLayout.displayRank(this.items,1);

           var scrollBar:moon.ScrollBar=new moon.ScrollBar();
            scrollBar.target=this.conatiner;
            scrollBar.setSize(rect.width,rect.height-dis-2);
            scrollBar.layout(moon.Const.VERTICAL);
            this.addChild(scrollBar);
            scrollBar.x=rect.x+1
            scrollBar.y=rect.y+dis+2;
        }
        protected onClick(e:egret.TouchEvent):void
        {
            this.removeFromParent();
        }
        public update(data:Object):void
        {
            for(var i=1;i<10;i++){
                //this.txtScore
            }
        }
    }
    export class RankItem extends BasicView
    {
        private w:number;
        private rank:number;
        private txtRank:TextField;
        private txtScore:TextField;
        private colors:number[]=[0,0XDD823B,0XD2A85E,0XDFD164];
        public constructor(w:number,rank:number)
        {
            super();
            this.w=w;
            this.rank=rank+1;
            this.initView();

        }
        protected initView():void
        {
            var bg:Sprite=this.createRect(this.w,80,0);
            bg.alpha=this.rank%2==0?0.6:0.1;
            this.addChild(bg);

            this.txtRank=this.createText(100,0);
            this.txtScore=this.createText(400,0);
            if(this.rank<=3){
               this.txtRank.textColor=this.txtScore.textColor=this.colors[this.rank];
            }
            this.txtRank.text=String(this.rank);
            this.txtScore.text=String(10000-this.rank);
            Layout.getIns().setCenterYByPanent(this.txtRank);
            Layout.getIns().setCenterYByPanent(this.txtScore);
        }
    }
    /**游戏数据存储*/
    export class BasicGameStorage
    {
        /**只能内部访问,在外部修改gameId */
        private static getGameIdKey(key:string):string{return GameData.gameId+key}
        /**本地 数据写入*/
        public static localWrite(key:string,value:string):void{
            egret.localStorage.setItem(this.getGameIdKey(key),value);
        }
        /**本地 数据读取*/
        public static localRead(key:string):string{
            return egret.localStorage.getItem(this.getGameIdKey(key));
        }
        /**本地 数据删除*/
        public static localRemove(key:string):any{
            egret.localStorage.removeItem(this.getGameIdKey(key));
        }
        /**本地 数据清空*/
        public static localClear():any{
            egret.localStorage.clear();
        }
        /**服务器 数据写入*/
        public static serverWrite():void{}
        /**服务器 数据读取*/
        public static serverRead():string{return ""}
        /**服务器 数据删除*/
        public static serverRemove():void{}
    }
}
