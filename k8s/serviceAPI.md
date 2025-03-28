# ServiceAPIs カテゴリ

### Service と Ingress についてまとめてみる

### Service は L4 ロードバランシング、Ingress は L7 ロードバランシングを提供するリソース

---

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

前段にしては説明過多だったが、ここからが本題。さっそく ClusterIP からさらっていく。

## ClusterIP

Coming soon

## ExternalIP

Coming soon

## NodePort

Coming soon

## LoadBalancer

Coming soon

## Headless

Coming soon

## ExternalName

Coming soon

## None-Selector

Coming soon

# Ingress

Coming soon
