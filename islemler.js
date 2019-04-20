var app = angular.module('myApp', []);

var kisi="",kullaniciVarMiGiris,kullaniciVarMiKaydet;

app.controller('appController', function ($scope) {
    
    $scope.var=true;

    $scope.logIn=function(){

        var kadi = $("#kadi").val();

        if(kadi!=""){

            kullaniciVarMiGiris=$scope.hasLoginUser(kadi);
           
            if(kullaniciVarMiGiris=="true"){

                $("#girisEkrani").hide();

                $("#users").empty();

                $scope.getUsers();
    
                $("#kullanicilar").show();   
                
                localStorage.removeItem("loginState");
                
            }

            else{
                alert("Sistemde kaydınız bulunmamaktadır. Lütfen giriş yapmak için kayıt olunuz.");
            }

        }

    }
    
    $scope.logOut=function(){
        clearInterval(function(){ $("#mesajAlani").html(""); $scope.chatYukle(kisi); });
        $("#chatEkrani").hide();
        $("#kullanicilar").hide();
        localStorage.removeItem("regState");
        localStorage.removeItem("loginState");
        $("#girisEkrani").show();  
    }

    $scope.registerMember = function () {

        var kadi = $("#kadi").val();

        if (kadi != "") {
            
            kullaniciVarMiKaydet=$scope.searchUser(kadi);
            
            if(kullaniciVarMiKaydet=="true"){
                alert("Sistemde mevcut kullanıcı bulunmaktadır! Lütfen başka kullanıcı adı giriniz.");  
                localStorage.removeItem("regState");
            }

            else{
               
              var userKey = firebase.database().ref("users/").push().key; //Rastgele bir userkey gönderir.
                 firebase.database().ref("users/" + userKey).set({
                    username: kadi,
                    kulid: userKey
                 });

                 alert("Üye oldunuz! Tebrikler.");

            }

        }
         
        else {
            alert("Kullanıcı adını boş bırakmayınız!");
        }

    }

    $scope.sendMessage = function () {

        var mesaj = $("#mesaj").val();
        var kadi = $("#kadi").val();
        var alacakKisi=$("#users").val();

        if (kadi != "" && mesaj != "" && alacakKisi!="") {

            var tarih = new Date();
            var messageKey = firebase.database().ref("chats/").push().key; //Rastgele bir mesaj keyi gönderir.
            firebase.database().ref("chats/" + messageKey).set({
                message: mesaj,
                from: kadi,
                to:alacakKisi,
                tarih: tarih.getTime()
            });
            //Otomatik olarak en alt kısma odakanılır
            $("#mesaj").val(''); //Mesaj inputunu temizleyelim
        } else {
            alert("Lütfen boş alan bırakmayınız!");
        }

    }

    $scope.loadChat = function (x) {
       
        var query = firebase.database().ref("chats");
        var kadi = $("#kadi").val();
       
        query.on('value', function (snapshot) {
            $("#mesajAlani").html("");

            snapshot.forEach(function (childSnapshot) {

                var data = childSnapshot.val();

                if (data.from == kadi && data.to==x) {
                    //Mesaj bizim tarafımızdan gönderilmişse bu alan çalışacak
                    var mesaj = `<div class="d-flex justify-content-end">
                <div class="alert alert-info" role="alert">
                    `+ data.message + ` <b>@` + data.from + `</b>
                      </div>
                 </div>`;
                    $("#mesajAlani").append(mesaj);
                } else if(data.from==x && data.to==kadi) {
                    //Mesaj başkası tarafından gönderilmişse bu alan çalışacak
                    var mesaj2 = `<div class="d-flex">
                                    <div class="alert alert-dark" role="alert">
                                      <b>@`+ data.from + `</b> ` + data.message + `
                                  </div>
                           </div>`;
                    $("#mesajAlani").append(mesaj2);
                }
                $(".card-body").scrollTop($('.card-body')[0].scrollHeight - $('.card-body')[0].clientHeight);
           
            });

        });

    }

    $scope.startChat=function(){
            kisi=$("#users").val();
            $("#chatEkrani").show();
            setInterval(function(){ $("#mesajAlani").html(""); $scope.loadChat(kisi); }, 900);
    }

    $scope.finishChat=function(){
          clearInterval(function(){ $("#mesajAlani").html(""); $scope.loadChat(kisi); });
        $("#chatEkrani").hide();
    }

    $scope.searchUser=function(a){

        var query = firebase.database().ref("users");
        var regState=false;
       
        query.on('value', function (snapshot) {
      
                snapshot.forEach(function (childSnapshot) {

                    var data = childSnapshot.val();
                    
                    if (data.username == a){
                          regState=$scope.var;
                          localStorage.setItem("regState",regState);                               
                    }
         
                 });
          
        });

        return localStorage.getItem("regState");

    }

    $scope.hasLoginUser=function(x){

        var query = firebase.database().ref("users");
        var loginState=false;
       
        query.on('value', function (snapshot) {
      
                snapshot.forEach(function (childSnapshot) {

                    var data = childSnapshot.val();
                    
                    if (data.username == x){
                           loginState=$scope.var; 
                           localStorage.setItem("loginState",loginState);                             
                    }
         
                 });
                
        });

        return localStorage.getItem("loginState");

    }

    $scope.getUsers = function () {

        var kadi = $("#kadi").val();

        var query = firebase.database().ref("users");

        query.on('value', function (snapshot) {
      
                $("#mesajAlani").html("");
                snapshot.forEach(function (childSnapshot) {
                    var data = childSnapshot.val();

                    if (data.username != kadi) {
                        var kisi = "<option class='dropdown-item' value='" + data.username + "'>" + data.username + "</option>";
                        $("#users").append(kisi);
                    }
             
            });

        });

    }


});
