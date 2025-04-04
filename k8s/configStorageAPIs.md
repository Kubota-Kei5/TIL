# Config & Storage APIs カテゴリ

### コンテンツの構成：

1. intro
1. 環境変数の利用について
1. Secret
1. ConfigMap
1. PersistentVolumeClaim

## 1. intro

Kubernetes リソースのカテゴリ（再掲）
| 種別 | 概要 |
| :------------- | :--------------------------------------------------------------- |
| Workloads APIS カテゴリ | コンテナの実行に関するリソース |
| Service APIs カテゴリ | コンテナを外部に公開するためのエンドポイントを提供するリソース |
| Config & Storage APIs カテゴリ | 設定/機密情報/永続化ボリュームなどに関するリソース |
| Cluster APIs カテゴリ | セキュリティやクォータに関するリソース |
| Metadata APIs カテゴリ | クラスタ内のリソースを操作するためのリソース |

<br>
Config & Storage APIs カテゴリに分類されるリソースは下記の 3 つ<br>
<br>

- Secret
- ConfigMap
- PersistentVolumeClaim

## 2. 環境変数の利用について

Kuberntes では、クラスタ内のコンテナに対して環境変数を利用する場合、Pod テンプレートに`env`または`envForm`を指定する。<br>
主に下記 5 つの情報源から環境変数を埋め込むことができる。<br>

- 静的設定
- Pod の情報
- コンテナの情報
- Secret リソースの機密情報
- ConfigMap リソースの設定値

### 静的設定

`spec.containers[].env`に静的な値として定義することで利用

```yaml
apiVersion: example1
kind: Pod
metadata:
  name: example-env
  labels:
    app: example-app
spec:
  containers:
    - name: nginx-container
      image: nginx:1.16
      env:
        - name: MAX_CONNECTION
          value: "100"
        - name: TZ
          value: Asia/Tokyo
```

### Pod の情報

Pod の名前や IP を環境変数として使いたい場合は、`fieldRef`を用いる。

```yaml
apiVersion: example1
kind: Pod
metadata:
    name: example-env
    labels:
        app: example-app
spec:
    containers:
    - name: nginx-container
      image: nginx:1.16
      env:
    　- name: MY_POD_IP
        　valueFrom:
        　fieldRef:
          　  fieldPath: status.podIP  # PodのIPを環境変数として使っている
    　- name: MY_POD_NAME
      　  valueFrom:
        　fieldRef:
          　  fieldPath: metadata.name # # Podの名前を環境変数として使っている
```

### コンテナの情報

Pod には複数のコンテナの情報が含まれるため各コンテナに関する情報については`filedRef`で取得できない。<br>
そこで、コンテナのリソースに関する情報を環境変数として利用する場合は`resourceFieldRef`を使う。

```yaml
apiVersion: example1
kind: Pod
metadata:
    name: example-env
    labels:
        app: example-app
spec:
    containers:
    - name: nginx-container
      image: nginx:1.16
      env:
      - name: CPU_REQUESTS
        valueFrom:
            resourceFieldRef:
                containerName: nginx-container
                resource: requests.cpu
      - name: CPU_LIMITS
            valueFrom:
            resourceFieldRef:
                containerName: nginx-container
                resource: limits.cpu
```

### Secret リソースの機密情報

Secret リソースの機密情報を環境変数として使いたい場合は、`secretKeyRef`を用いる。<br>
※Secret リソースの話はあとの章で解説。

```yaml
apiVersion: example1
kind: Pod
metadata:
  name: example-env
  labels:
    app: example-app
spec:
  containers:
    - name: nginx-container
      image: nginx:1.16
      env:
        - name: CPU_REQUESTS
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
```

### ConfigMap リソースの設定値

ConfigMap リソースの機密情報を環境変数として使いたい場合は、`configMapRef`を用いる。<br>
※ConfigMap リソースの話はあとの章で解説。

```yaml
apiVersion: example1
kind: Pod
metadata:
  name: example-env
  labels:
    app: example-app
spec:
  containers:
    - name: nginx-container
      image: nginx:1.16
      env:
        - name: CPU_REQUESTS
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
```

## 3. Secret

### Secret の概要と使い方

Secret リソース とは、パスワードや API キー、認証トークンなどの機密情報を安全に管理・利用するための仕組み。
<br>

Secret のマニフェストイメージ：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-secret
type: Opaque # typeには色々種類があるのでそれはあとで解説
data: # Base64でエンコードされた文字列
  username: dXNlcm5hbWU=
  password: cGFzc3dvcmQ=
```

data の中身に Secret で管理したい値を入れるが、base64 でエンコードされているだけで bcrypt でハッシュ化したりといった暗号化処理はされていないのが注意ポイント。<br>
また、マニフェストから Secret リソースを作成する場合は、base64 でエンコードした文字列を直接定義ファイルに入力しなければならない。<br>
※Secret が定義されたマニフェストを暗号化するオープンソースソフトウェアもあるみたいだがそれは追々まとめる。

Secret の使い方は主に 2 つある。

1. 環境変数として渡す。<br>
   これは[前述](#secret-リソースの機密情報)で説明済み。<br>
   アプリ内では通常の環境変数として参照可能。

```bash
echo $DB_USERNAME
echo $DB_PASSWORD
```

<br>
2. ボリュームとしてマウントする。<br>
PodリソースにボリュームとしてマウントすることでSecret管理している機密情報を取得できる。<br>
podマニフェスト例：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-volume-example
spec:
  containers:
    - name: app
      image: busybox
      command: ["sleep", "3600"]
      volumeMounts:
        - name: my-secret-volume
          mountPath: "/etc/secrets"
          readOnly: true # アプリがファイルを書き換えないようにtrueが推奨
  volumes:
    - name: my-secret-volume
      secret:
        secretName: my-secret
```

<br>

### Secret の分類

Secret リソースで定義できる type にはいくつか種類がある。（下表参照）
| type | 概要 |
| :------------- | :--------------------------------------------------------------- |
| Opaque | 一般的な汎用用途 |
| kubernetes.io/tls | TLS 証明書用 |
| kubernetes.io/basic-auth | Basic 認証用 |
| kubernetes.io/dockerconfigjson | Docker レジストリの認証情報用 |
| kubernetes.io/ssh-auth | SSH の認証情報用 |
| kubernetes.io/service-account-token | Service Account のトークン用 |
| bootstrap.kubernetes.io/token | Bootstrap トークン用 |

## 4. ConfigMap

## 5. PersistentVolumeClaim
