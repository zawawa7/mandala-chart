# ベースイメージ
FROM python:3.9

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係のインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# フロントエンドのビルド
FROM node:14 as build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

# バックエンドとフロントエンドのコピー
FROM python:3.9
WORKDIR /app
COPY --from=build /app/build ./frontend/build
COPY backend .

# アプリケーションの実行
CMD ["python", "app.py"]