# ServiceAPIs カテゴリ

### Service と Ingress についてまとめてみる

### Service は L4 ロードバランシング、Ingress は L7 ロードバランシングを提供するリソース

L4 だの L7 だのロードバランシングだの、1 年半前に受験した応用情報以来のご対面でわけわかめ。<br>
ということで、まずは OSI 基本参照モデル、ロードバランシングについて思い出す。

<details><summary>OSI基本参照モデルってなんだっけ</summary>

- [コンパクトにまとめた説明：Qiita](https://qiita.com/nakamura_slj/items/0c827de1dab6ebc722d2)<br>
- [きれいに図表にまとめていた説明：アイティエム](https://www.itmanage.co.jp/column/osi-reference-model/)<br>
- [レストランで例えた説明：ネットアテスト](https://www.netattest.com/osi_2022_mkt_fsp)<br>
- [ベッドの運搬で例えた説明：Zenn](https://zenn.dev/itpassport/articles/03bd090fa135ba)<br>

</details>

<details><summary>ロードバランシングってなんだっけ</summary>

- [個人的おすすめ記事：Zenn](https://zenn.dev/mi_01_24fu/articles/load-balancer_2024_07_13)<br>
- [天下の AWS 公式説明：AWS](https://aws.amazon.com/jp/what-is/load-balancing/)<br>
- [えこひいきで自社コンテンツも残しておく：NTT コミュニケーションズ](https://www.ntt.com/bizon/glossary/j-r/load-balancer.html)<br>

</details>
<br>
<br>

# Service

Service リソースには 7 種の Service type がある

- ClusterIP
- ExternalIP
- NodePort
- LoadBalancer
- Headless
- ExternalName
- None-Selector

kubernetes クラスタを作ると、ノードに pod のための内部ネットワークを自動的に構成する<br>
このとき、同じ pod 内であればすべてのコンテナは同じ IP アドレスが割り当てられる<br>
　 → 同じ pod のコンテナと通信：localhost 宛て<br>
　 → 別の pod のコンテナと通信：別 pod の IP アドレス宛<br>

つまり、Service リソースを使わなくてもノード間の通信に困ることはない。<br>
じゃあ Service リソースを使うと何がうれしいのか。<br>

実は、Service リソースを使うことで大きなメリットが 2 つある。<br>

<details><summary>其の壱：pod宛トラフィックのロードバランシング</summary>

メリット其の壱は、ずばりロードバランシングである。<br>
おさらいしたロードバランシングがさっそく登場する。<br>
Service リソースを使うと、targetPort を指定することができる。<br>
ClusterIP によって提供されたエンドポイントに http リクエストが飛んでくると、<br>
targetPort に指定した IP アドレスを持つ pod たちに対して勝手にロードバランシングしてくれる。

yaml ファイル例：

```
apiVersion: example1
kind: Service
metadata:
    name: example-clusterip
spec:
    type: ClusterIP
    ports:
    - name: "http-port"
      protocol: "TCP"
      port: 8080        //このport番号はEndpointのport番号のこと
      targetPort: 80    //指定したport番号を持つpod宛てにロードバランシング
    selector:
      app: example-app
```

targetPort には port 番号だけでなく名前付けした port の name を指定することもできるが、ここでは詳しい説明を省略。<br>
名前で指定すると嬉しいのは、<br>
複数の port 番号にまたがって名前付けすると、
ロードバランシングする宛先も複数の port 宛てにできるというところ。

</details>

<details><summary>其の弐：サービスディスカバリとクラスタ内DNS</summary>

まずは言葉の定義から。<br>
ここでいう「サービスディスカバリ」とは、<br>
**Service に属する pod を洗い出したり、Service の名前からエンドポイントの情報を得る機能**のことである。<br>

其の壱で解説したとおり、ClusterIP によって提供されたエンドポイントの IP アドレスを使えば、各 pod へのロードバランシングが可能になるが、Service を再作成するたびに IP アドレスを毎回調べるのは面倒だし、そもそも IP アドレスで覚えるというのも大変である。<br>
普通ネットで検索するときも、欲しい情報が入っている web サーバーの IP アドレスを入力することはなく、URL という人が理解しやすい文字列で検索している。（いわゆる DNS という仕組みである。）<br>
そして、Kubernetes でも同じように ClusterIP のエンドポイント情報ではなく、yaml で分かりやすい文字列を指定しておいて、その文字列でエンドポイントに接続できるんだぜ。という話である。<br>

</details>
<br>
前段にしては説明過多だったが、ここからが本題。さっそく ClusterIP からさらっていく。

## ClusterIP

実は CluterIP の説明は大体前段で説明済みである。追加情報は 1 つだけ。<br>
ClusterIP に入る前の説明の再掲になるが、<br>
ClusterIP で提供されるエンドポイントは、spec.ports[].port で指定できる。<br>

ただし、 **一度設定した ClusterIP は「kubectl apply」で更新ができない。** というのが注意ポイント。
ClusterIP を改めて指定したい場合は、削除してから再作成する必要がある。

## ExternalIP

ExternalIP の説明はぎゅっと縮めると、<br>
「外部から Kubernetes 内のエンドポイントにアクセスするための IP アドレスを作る。という機能」<br>
<br>
通常、ClusterIP で提供されるエンドポイントは Kubernetes 内でのみ有効な Internal Network の仮想 IP として払い出される。<br>
ただ、この ExternalIP Service を使って外部からアクセス可能な IP アドレスを作り出すことができる。<br>
マニフェストはこんな感じ ↓

<details><summary>ExternalIP Serviceを作成する際のマニフェスト例(.yaml)</summary>

```
apiVersion: example1
kind: Service
metadata:
    name: example-externalip
spec:
    type: ClusterIP    //Externalというtypeがあるわけではない
    externalIPs:       //ここではKubernetes NodeのIPアドレスを指定
    - 10.240.0.4
    - 10.240.0.5
    ports:
    - name: "http-port"
      protocol: "TCP"
      port: 8080
      targetPort: 80
    selector:
      app: example-app
```

</details>
<br>

注意点：<br>
実際には、ExternalIP Service で ExternalIP を作成しただけでは外部からアクセスできない。<br>
そのため、下記のようなインフラの設定が必要だったりもする。<br>

- ExternalIP をクラスタノードに割り当てる
- ノードに届くようにルーターやファイアウォールを設定する

<br>

とりあえずここまで説明をまとめたが、<br>
**特別な事情がない限りは後述の NodePort を使うことが推奨** されている。

## NodePort

さっそくだが、NodePort とは「すべての Kubernetes Node の IP アドレス：port 番号で受信したトラフィックをコンテナに転送する機能。」である。<br>
そのため、ExternalIP との違いは、特定のノードを指定するか、すべてのノードを指定するか。ということになる。
<br>
マニフェストはこんな感じ ↓

<details><summary>NodePort Serviceを作成する際のマニフェスト例(.yaml)</summary>

```
apiVersion: example1
kind: Service
metadata:
    name: example-nodeport
spec:
    type: NodePort       //typeでNodePortを指定
    ports:
    - name: "http-port"
      protocol: "TCP"
      port: 8080         //ClusterIPで受け付けるport番号
      targetPort: 80     //転送先のport番号
      nodePort: 30080    //全Kubernetes Nodeで受けつけるためのport番号
    selector:
      app: example-app
```

</details>
<br>
ここでの注意ポイントは 2 つだけ。

- spec.ports[].nodePort で指定できる port 番号は 30000~32767（Kubernetes Mater で範囲を変更することも可）
- NodePort を複数作成する場合、spec.ports[].nodePort で指定する port 番号の重複は許されない

## LoadBalancer

ExternalIP や NodePort は外部疎通性のある仮想 IP を払い出してくれていましたが、LoadBalancer Service は、Kubernetes クラスタ外のロードバランサと外部疎通性のある仮想 IP を払い出してくれる。<br>

ExternalIP や NodePort で払い出された外部疎通性のある仮想 IP（IP アドレス:port 番号）は結局いずれかの Kubernetes Node に割り当てられた IP アドレス宛に通信を行う。<br>
そのため、そのノードで障害が起こるとトラフィックの処理ができなくなってしまう。<br>
要するに、障害が発生した Kuberntes Node が単一障害点になってしまうというデメリットがある。場合によってはサービス断になってしまう。<br>

一方で、LoadBalancer Service を使うと外部のロードバランサから Kubernetes Node 宛てにバランシングする。そのため、どこかの Kubernetes Node で障害が発生した場合は、LoadBalancer がノードの障害を検知してロードバランシングする際の転送先から除外してくれる。<br>
これによって障害時の通信断を回避することができる。<br>
※とはいっても障害を検知してから LoadBalancer が転送先の除外を行うまでのリードタイムがあるので完全に回避できるわけではないのはご容赦いただきたい。。<br>

マニフェストはこんな感じ ↓

<details><summary>LoadBalancer Serviceを作成する際のマニフェスト例(.yaml)</summary>

```
apiVersion: example1
kind: Service
metadata:
    name: example-loadbalancer
spec:
    type: LoadBalancer                //typeでLoadBalancerを指定
    loadBalancerIP: ***.***.***.***   //LoadBalancerが払い出す仮想IPを指定することもできる
    ports:
    - name: "http-port"
      protocol: "TCP"
      port: 8080
      targetPort: 80
    selector:
      app: example-app
    loadBalancerSourceRanges:         //Kubernetes Node側のiptablesを利用してアクセス制御ができる
    - 10.0.0.0/8
```

</details>
<br>
最後にポイントを 2 つだけ挙げておく

- spec.loadBalancerIP で、LoadBalancer によってい払い出される仮想 IP を指定できる。
- spec.loadBalancerSourceRanges でファイアウォールルールの設定ができる。未指定の場合はデフォルトの 0.0.0.0/0 が指定され、全世界に公開される。他にも NetworkPolicy リソースを使ったアクセス制御もあるが、スケーラビリティの低下やレイテンシに影響しやすいので、可能な限り外部のロードバランサ側（spec.loadBalancerSourceRanges）でアクセス制御することが望ましい。

## Headless

Headless Service は、ロードバランシングするための IP アドレスは提供されず、DNS Round Robin（DNS RR）を使ったエンドポイントを提供する。<br>

※ちなみにこれまでの各 Service ってどんなだっけ。を簡単に振り返ると下記の通り。（下表参照）

| Service の種類 | 提供するエンドポイントの内容                                     |
| :------------- | :--------------------------------------------------------------- |
| ClusterIP      | Kubernetes クラスタ内でのみ利用可能な Internal Network の仮想 IP |
| ExternalIP     | 特定の Kubernetes Node の IP                                     |
| NodePort       | 全 Kubernetes Node の全 IP アドレス                              |
| LoadBalancer   | クラスタ外で提供されている LoadBalancer の仮想 IP                |

DNS RR を使ったエンドポイントを提供する。と言われてもピンとこないので、

- 動作イメージ
- ユースケース
  の二つに分けてもう少し説明を加える。

### 動作イメージ：

＜通常の Service ＞

```mermaid
graph LR
A(クライアント) --> B(ServiceIP / ClusterIP)
B(ServiceIP / ClusterIP) --> kube-proxyでPodへ振り分け
```

- クライアントは常に 1 つの仮想 IP（VIP）にアクセスし、その後複数の Pod へロードバランシングされる
  <br>

＜ Headless Service ＞

```mermaid
graph LR
A(クライアント) --> B(DNS名前解決) --> C(Pod一覧を取得) --> D(アプリ側ロジックなどでPodにアクセス)
```

- 1 つの仮想 IP が存在しない
- DNS クエリ時に複数 Pod の A レコード（Address Record）が返される
- クライアント（アプリ）がどの Pod にアクセスするか自由に決定できる

### ユースケース

前述の内容の再掲になる部分もあるが、ユースケースを 3 つぐらい取り上げる

1. Pod へ直接アクセスしたいとき：<br>
   アプリケーション側で独自に負荷分散などを行いたい場合に、Pod ひとつひとつの IP を指定して直接アクセスしたいときがある
1. Statefulset との組み合わせ：← これ実際に多そう<br>
   Statefulset はレプリカごとにユニークな DNS ホスト名が割り当てられます。<br>
   ※pod-name.headless-service-name.namespace.svc.cluster.local 　で勝手に名前が付けられるんでしたよね。<br>
   つまり、永続的かつユニークな FQDN を持てるため、Pod の再スケジューリングが起きても通信先のホスト名が変わらずに済む
1. DNS ベースで Pod のリストを取得したい場合<br>
   Headless Service を介して DNS のクエリを実行すると、Service ではなく Pod 自身の IP アドレスが返ってくる。Pod 直結の IP アドレスが欲しい時には非常に役立つ。

<br>
マニフェストはこんな感じ ↓

<details><summary>Headless Serviceを作成する際のマニフェスト例(.yaml)</summary>

```
apiVersion: example1
kind: Service
metadata:
    name: example-headless
spec:
    type: ClusterIP             //typeでClusterIPを指定
    ClusterIP: None             //ClusterIPでNoneを指定
    ports:
    - name: "http-port"
      protocol: "TCP"
      port: 80
      targetPort: 80
    selector:
      app: example-app
```

</details>

## ExternalName

ExternalName は、Kubernetes の Service の中でも特殊なタイプの Service である。<br>
これまで取り上げてきた Service（ClusterIP / NodePort / LoadBalancer / Headless）が Pod への通信のための経路を作るのに対し、ExternalName はまったく別の外部ホスト名（FQDN）へのエイリアス（別名）を作るだけのものである。

マニフェストはこんな感じ ↓

<details><summary>ExternalName Serviceを作成する際のマニフェスト例(.yaml)</summary>

```
apiVersion: example1
kind: Service
metadata:
    name: example-externalname
    namespace: default
spec:
    type: ExternalName                    //typeでClusterIPを指定
    externalName: external.example.com    //外部のドメイン名を指定
```

</details>

<br>
言葉だけでもなんとなくのイメージはつくかもしれないが、一応ユースケースも載せておく。<br>

- 外部サービスへの名前付きアクセスポイントを提供する<br>
  アプリケーションが外部の API やデータベースを利用していて、それを Kubernetes 内の Service 名として扱いたいとき、アプリ側は、my-database.default.svc.cluster.local にアクセスするだけで済む。

```
外部サービス: mydb.rds.amazonaws.com
内部で使いたい名前: my-database
```

- 開発~本番での環境設定の変更を最小限にする<br>
  例えば、開発段階ではローカルの DB コンテナに向け、本番では RDS（Amazon RDS）に向けたいときでも、Service 名のみの切り替えで済む。

<br>

## None-Selector

None-Selector Service とは、Selector を省略 or 指定しないことで、Service がどの Pod にも自動で紐づかないようにする Service です。
<br>

おさらいですが、これまで Service のマニフェストでは下記のように spec.selector で、ラベル対象の Pod を自動的に選びトラフィックをルーティングしていました。

```yaml
spec:
  selector:
    app: example-app # app: example-appを持つPodに自動的にトラフィックを流す
```

None-Selector Service は、その逆で Selector を省略 or 指定しないことで、Service がどの Pod にも自動で紐づかないようにします。

<details><summary>Selectorを指定しないで Serviceを作成する際のマニフェスト例(.yaml)</summary>

```yaml
apiVersion: example1
kind: Service
metadata:
  name: example-none-selector-svc
spec:
  ports:
    - port: 80
      targetPort: 8080
```

</details>

<br>
くどいですが、Selector を指定しなかったらどうなるのか。答えは簡単で、このServiceにアクセスしても、KubernetesはどのPodにもトラフィックを送れなくなる。<br>
そこで、自分でエンドポイントを定義してどこに送るか明示してあげることになる。<br>
<br>

<details><summary>エンドポイントを指定したNone-Selector Serviceのマニフェスト例(.yaml)</summary>

```yaml
apiVersion: v1
kind: Endpoints
metadata:
  name: my-none-selector-svc
subsets:
  - addresses:
      - ip: 10.0.1.101
      - ip: 10.0.1.102
    ports:
      - port: 8080
```

これで、Service `my-none-selector-svc` に送られたリクエストは、10.0.1.101 や 10.0.1.102 に転送される。

</details>

<br>

かなり特殊な Service なので、使い方は限られるがユースケースとしては、下記が挙げられる

- Kubernetes 外部の Pod や VM にルーティングしたいとき
- 外部にロードバランシングしたい状況

<br>

# Ingress

Coming soon
