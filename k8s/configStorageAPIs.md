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

## 4. ConfigMap

## 5. PersistentVolumeClaim
