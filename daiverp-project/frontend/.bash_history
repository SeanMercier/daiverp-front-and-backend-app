ps aux | grep server.py
sudo netstat -tulnp | grep 8080
sudo kill -9 3902
nohup python3 /home/ec2-user/server.py > server.log 2>&1 &
ps aux | grep server.py
sudo netstat -tulnp | grep 8080
curl -X POST -F "file=@/home/ec2-user/uploads/test.csv" http://localhost:8080/upload
tail -f server.log
ls
sudo nano /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
tail -f server.log
ps aux | grep server.py
curl -X POST -F "file=@/home/ec2-user/uploads/test.csv" http://localh/upload
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
cd daiverp-p
cd daiverp-project/
cd frontend/
cd src/
cd components/
nano CSVUploader.js
sudo nano /etc/nginx/nginx.conf
tail -f server.log
cd..
cd
tail -f server.log
curl -X POST -F "file=@/home/ec2-user/uploads/test.csv" http://34.245.209.30:8080/upload
ls
cd uploads/
ls
nano test.csv 
sudo chmod -R 777 /home/ec2-user/uploads
cd
nano server.py
sudo chown -R ec2-user:ec2-user /home/ec2-user/uploads
sudo chmod -R 755 /home/ec2-user/uploads
sudo pkill -f server.py
python3 server.py 
nano server.py 
rm server.py 
nano server.py
python3 server.py 
sudo pkill -f server.py
python3 server.py 
sudo pkill -f server.py
python3 server.py 
sudo pkill -f server.py
ls
whoami
ps aux | grep server.py
sudo nano /etc/systemd/system/flask-app.service
ps aux | grep server.py
sudo systemctl daemon-reload
sudo systemctl enable flask-server
dir
cd /etc/systemd/system
ls
sudo nano /etc/systemd/system/flask-app.service
sudo systemctl daemon-reload
sudo systemctl enable flask-app
sudo systemctl start flask-app
sudo systemctl status flask-app
sudo systemctl is-enabled flask-app
ps aux | grep server.py
tail -f /home/ec2-user/server.log
sudo journalctl -u flask-app --no-pager --lines=50
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
curl -X POST -F "file=@/home/ec2-user/uploads/test.csv" http://localhost:8080/upload
curl -X POST -F "file=@/home/ec2-user/uploads/test.csv" http://52.50.121.4:8080/upload
ls
cd daiverp-project/
cd frontend/
cd src
cd components/
ls
rm CSVUploader.js
nano CSVUploader.js
npm run build
npm start
npm run build
npm start
52.50.121.4
tail -f /home/ec2-user/server.log
sudo journalctl -u flask-app --no-pager --since "5 minutes ago"
sudo journalctl -u flask-app --no-pager --since "15 minutes ago"
curl -X POST -F "file=@/home/ec2-user/uploads/test_one_row.csv" http://localhost:8080/upload
curl -X POST -F "file=@/home/ec2-user/uploads/test.csv" http://localhost:8080/upload
cd uploads/
ls
nano test.csv
curl -X POST -F "file=@/home/ec2-user/uploads/test.csv" http://localhost:8080/upload
cd
ls
nano server.py
rm server.py
nano server.py
cd daiverp-project/
cd frontend
cd src
cd components/
rm CSVUploader.js
nano CSVUploader.js
ps aux | grep server.py
sudo pkill -f server.py
ps aux | grep server.py
sudo systemctl restart flask-app
cd
pip install watchdog
watchmedo auto-restart --pattern="*.py" --recursive -- python3 /home/ec2-user/server.py
cd daiverp-project/
cd frontend/
cd src
cs components/
cd components/
nano CSVUploader.js
rm CSVUploader.js
nano CSVUploader.js
cd
nano server.py
rm server.py
nano server.py
cd daiverp-project/
cd frontend/
cd src
cd components/
rm Dashboard.js
nano Dashboard.js
npm run build
cd daiverp-project/
cd frontend/
cd src/
cd components/
npm run build
npm start
cd daiverp-project/
cd frontend/
cd src
cd components/
npm run build
npm start
rm Dashboard.js
nano Dashboard.js
rm Dashboard.js
nano Dashboard.js
rm Dashboard.css
nano Dashboard.css
nano Dashboard.js
rm Dashboard.js
nano Dashboard.js
nano Dashboard.css
npm run build
cd daiverp-project/
cd frontend/
cd src
cd components/
rm Dashboard.js
nano Dashboard.js
npm run build
npm start
npm run build
npm start
npm run build
npm start
npm run build
cd 
nano server.py
ps aux | grep server.py
sudo journalctl -u flask-app --no-pager --lines=50
cd uploadds
cd uploads/
nano system_log.csv 
cd
curl -X POST -F "file=@/home/ec2-user/uploads/system_log.csv" http://localhost:8080/upload
nano server.py
cd uploads
ls
cd
nano server.py
rm server.py
nano server.py
sudo systemctl restart flask-app
curl -X POST -F "file=@/home/ec2-user/uploads/system_log.csv" http://localhost:8080/upload
exit
cd daiverp-project/
cd frontend/
cd src
cd components/
npm run build
npm start
python3 /home/ec2-user/model/predict.py /home/ec2-user/model/system_architecture_log.csv /home/ec2-user/model/cve_log.csv
cd
cd model
ls
python3 /home/ec2-user/model/predict.py /home/ec2-user/uploads/system_log.csv /home/ec2-user/uploads/cve_log.csv
python3 /home/ec2-user/model/predict.py /home/ec2-user/uploads/system_log.csv /home/ec2-user/uploads/test.csv
cd
cd uploads
ls
nano system_log.csv 
nano test.csv 
ls
cd
nano server.py
ps aux | grep server.py
sudo systemctl status flask-app
curl -X POST -F "file=@test.csv" http://<your-ec2-ip>:8080/upload
curl -X POST -F "file=@test.csv" http://52.50.121.4:8080/upload
cd uploads
curl -X POST -F "file=@test.csv" http://52.50.121.4:8080/upload
cd model
l
ls
ps aux | grep server.py
http://localhost:8080/
cd model
ls
cd
cd uploads
ls
sudo systemctl status flask-app
cd
curl -X POST -F "file=@/home/ec2-user/uploads/system_log.csv" http://localhost:8080/upload
cd uploads
nano system_log.csv 
[ec2-user@ip-172-31-17-138 ~]$ curl -X POST -F "file=@/home/ec2-user/uploads/system_log.csv" http://localhost:8080/upload
{   "error": "Processing failed"; }
cd
sudo tail -f /var/log/flask-app.log
sudo journalctl -u flask-app --no-pager | tail -n 50
tail -f server.log
sudo journalctl -u flask-app --no-pager | tail -n 50
python3
nano server.py
rm server.py
nano server.py
curl -X POST -F "file=@/home/ec2-user/uploads/system_log.csv" http://localhost:8080/upload
cd model
ls
curl -X POST -F "file=@/home/ec2-user/model/system_architecture_sample.csv" http://localhost:8080/upload
cd model
ls
tail -f /home/ec2-user/server.log
nano system_architecture_sample.csv 
python3 -c "
import pandas as pd
sys_log = pd.read_csv('/home/ec2-user/model/system_architecture_sample.csv')
print('System Architecture Columns:', sys_log.columns.tolist())
"
python3 -c "
import pandas as pd
cve_log = pd.read_csv('/home/ec2-user/model/cve_log_sample.csv')
print('CVE Log Columns:', cve_log.columns.tolist())
"
nano predict.py
cd
rm server.py
nano server.py
curl -X POST -F "file=@/home/ec2-user/model/system_architecture_sample.csv" http://localhost:8080/upload
cd model
nano cve_log_sample.csv 
python3 -c "
import pandas as pd
sys_log = pd.read_csv('/home/ec2-user/model/system_architecture_sample.csv')
cve_log = pd.read_csv('/home/ec2-user/model/cve_log_sample.csv')
merged_df = sys_log.merge(cve_log, on='Product', how='inner')
print(merged_df.head())
"
curl -X POST -F "file=@/home/ec2-user/model/system_architecture_sample.csv" http://localhost:8080/upload
nano server.py
python3 /home/ec2-user/model/predict.py /home/ec2-user/model/system_architecture_sample.csv /home/ec2-user/model/cve_log.csv
cd model
ls
python3 /home/ec2-user/model/predict.py /home/ec2-user/model/system_architecture_sample.csv /home/ec2-user/model/cve_log.csv
python3 /home/ec2-user/model/predict.py /home/ec2-user/model/system_architecture_log.csv /home/ec2-user/model/cve_log.csv
nano predict.py
python3 /home/ec2-user/model/predict.py /home/ec2-user/model/system_architecture_log.csv /home/ec2-user/model/cve_log.csv
nano predict.py 
python3 /home/ec2-user/model/predict.py /home/ec2-user/model/system_architecture_log.csv /home/ec2-user/model/cve_log.csv
curl -X POST -F "file=@/home/ec2-user/model/system_architecture_log.csv" http://localhost:8080/upload
cd
nano server.py
sudo nano /etc/nginx/nginx.conf
rm server.py
nano server.py
cd model
nano predict.py
clear
rm predict.py 
nano predict.py
nano server.py
rm server.py
ls
cd
nano server.py
rm server.py
nano server.py
curl -X POST -F "file=@/home/ec2-user/model/system_architecture_sample.csv" http://localhost:8080/upload
curl -O http://localhost:8080/download/predictions.csv
ls
nano predictions
cd predictions/
ls
nano predictions.csv
rm predictions.csv
ls
cd
rm predictions.csv
tail -f /home/ec2-user/server.log
cd uploads/
ls
curl -X POST -F "file=@/home/ec2-user/uploads/system_log.csv" http://localhost:8080/upload
tail -f /var/log/syslog | grep flask
cd
sudo journalctl -u flask-app --no-pager --lines=50
sudo journalctl -u flask-app -f
curl -X POST -F "file=@/home/ec2-user/uploads/system_log.csv" http://localhost:8080/upload
python3 /home/ec2-user/model/predict.py /home/ec2-user/uploads/system_log.csv /home/ec2-user/model/cve_log.csv
cd model
ls
cd
ls
cd predictions/
ls
cd
cd model
nano predict.py
clear
rm predict.py 
nano predict.py
curl -X POST -F "file=@/home/ec2-user/uploads/system_log.csv" http://localhost:8080/upload
sudo systemctl status flask-app
sudo systemctl stop flask-app
python3 /home/ec2-user/server.py
nano server.py
sudo systemctl restart flask-app
cat /home/ec2-user/predictions/predictions.csv | head -n 10
python3 /home/ec2-user/model/predict.py /home/ec2-user/uploads/system_log.csv /home/ec2-user/model/cve_log.csv
cd predictions/
ls
nano predictions.csv 
nano server.py
cd daiverp-project/
cd frontend/
cd src
cd components/
nano CSVUploader.js
cat /home/ec2-user/predictions/predictions.csv
journalctl -u flask-app --no-pager --lines=50
cd daiverp-project/
cd frontend/
cd src
cd components/
nano Dashboard.js
clear
rm Dashboard.js
nano Dashboard.js
npm run build
npm start
rm Dashboard.js
nano Dashboard.js
npm run build
nano CSVUploader.js
rm CSVUploader.js
nano CSVUploader.js
npm run build
rm CSVUploader.js
nano CSVUploader.js
npm run build
nano CSVUploader.js
rm CSVUploader.js
nano CSVUploader.js
npm run build
nano Dashboard.js
npm run build
cd
cd predictions/
cat predictions.csv 
clear
cd
cd daiverp-project/
cd frontend/
cd src
cd components/
rm Dashboard.js
nano Dashboard.js
npm run build
cd
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
ls
nano server.py
cd predictions/
ls
nano predictions.csv
cd daiverp-project/
cd frontend/
cd src
cd components/
nano CSVUploader.js
npm run build
nano CSVUploader.js
rm CSVUploader.js
nano CSVUploader.js
npm run build
nano CSVUploader.js
npm run build
cd
nano server.py
pwd
ls
cd daiverp-project/
cd frontend/$
cd frontend
cd src
cd components/
npm run build
sudo nano /etc/nginx/nginx.conf
sudo nginx -t   # Test config syntax
sudo systemctl reload nginx
npm run build
sudo nano /etc/nginx/nginx.conf
sudo nginx -t   # Test config syntax
sudo systemctl reload nginx
npm run build
sudo lsof -i :8080
curl -X POST -F "file=@/home/ec2-user/uploads/system_log.csv" http://localhost:8080/upload
cd
cd uploads/
ls
curl -X POST -F "file=@/home/ec2-user/uploads/system_log.csv" http://localhost:8080/upload
cd
python3 server.py
curl -k -X POST -F "file=@/home/ec2-user/uploads/system_log.csv" https://localhost:8080/upload
cd daiverp-project/
cd frontend/
cd src
cd components/
nano CSVUploader.js
sudo nano /etc/nginx/nginx.conf
sudo nginx -t   # Test config syntax
sudo nano /etc/nginx/nginx.conf
sudo nginx -t   # Test config syntax
sudo systemctl reload nginx
sudo lsof -i :8080
python3 /path/to/server.py
python3 server.py
sudo nano /etc/nginx/nginx.conf
sudo nginx -t   # Test config syntax
sudo systemctl reload nginx
nano server.py
cd daiverp-project/
cd frontend/
cd src
cd components/
nano CSVUploader.js
npm run build
nano CSVUploader.js
curl -vk https://localhost:8080/upload
npm run build
nano CSVUploader.js
cd
nano server.py
cd daiverp-project/
cd frontend/
cd src
cd components/
nano Dashboard.js
rm Dashboard.js
nano Dashboard.js
npm run build
nano Dashboard.js
npm run build
cd daiverp-project/
cd frontend/
cd src
cd components/
nano Dashboard.js
npm run build
flask run --cert=cert.pem --key=key.pem --host=0.0.0.0 --port=8080
cd
flask run --cert=cert.pem --key=key.pem --host=0.0.0.0 --port=8080
nano server.py
cd daiverp-pr
cd daiverp-project/
cd frontend/
cd src/
cd components/
nano Dashboard.js
npm run build
sudo nano /etc/nginx/nginx.conf
sudo rm /etc/nginx/nginx.conf
sudo nano /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl restart nginx
npm run build
nano CSVUploader.js
cd
nano server.py
cd daiverp-project/
cd frontend/
cd srv
cd src
cd components/
nano Dashboard.js
nano CSVUploader.js
nano Dashboard.js
npm run build
nano CSVUploader.js
nano Dashboard.js
nano CSVUploader.js
npm run build
nano CSVUploader.js
nano Dashboard.js
npm run build
ls
nano server.py
clear
rm server.py
nano server.py
cd daiverp-project/
cd frontend/
cd src
cd components/
nano Dashboard.js
npm run build
nano Dashboard.js
rm Dashboard.js
nano Dashboard.js
npm run build
rm Dashboard.js
nano Dashboard.js
npm run build
rm Dashboard.js
nano Dashboard.js
npm run build
cd
ls
cd model 
nano predict.py 
rm predict.py 
nano predict.py
cd daiverp-project/
cd frontend/
cd src
cd components/
npm run build
cd
cd model
nano cve_log
rm cve_log
ls
nano cve_log.csv
cd model 
nano predict.py 
rm predict.py 
nano predict.py 
cd mo
cd model
nano predict.py 
rm predict.py 
nano predict.py 
cd model
nano cve_log.csv
clear
ls
exit
ls
cd model
ls
rm cve_log.csv
cd
move /home/ec2-user/cve_log.csv /home/ec2-user/model/cve_log.csv
mv /home/ec2-user/cve_log.csv /home/ec2-user/model/cve_log.csv
ls
cd model
ls
cd
chmod +x cve_log.csv
cd model
chmod +x cve_log.csv
ls
cd daiverp-project/
cd frontend/
cd src
cd components/
nano CSVUploader.js
sudo journalctl -u nginx -n 50 --no-pager
cd
cat server.log | tail -n 30
cd model
nano cve_log_sample.csv 
rm cve_log.csv 
ls
exit
ls
mv /home/ec2-user/cve_log.csv /home/ec2-user/model/cve_log.csv
ls
cd model
ls
chmod +x cve_log.csv
ls
cd molde
cd model
nano predict.py 
rm predict.py 
nano predict.py
cd model
rm predict.py 
nano predict.py
rm predict.py 
nano predict.py
cd
cd model 
nano cve_log.csv
rm cve_log.csv 
exit
cd model
ls
cd model
ls
exit
ls
mv /home/ec2-user/cve_log.csv /home/ec2-user/model/cve_log.csv
ls
cd model
ls
chmod +x cve_log.csv
ls
nano predict.py 
python3 predict.py system_architecture_sample.csv cve_log.csv 
rm cve_log.csv
exit
ls
mv /home/ec2-user/cve_log.csv /home/ec2-user/model/cve_log.csv
cd model
ls
chmod +x cve_log.csv
ls
nano predict.py 
rm predict.py 
nano predict.py 
nano cve_log.csv 
python3 predict.py system_architecture_sample.csv cve_log.csv 
rm cve_log.csv 
exit
mv /home/ec2-user/cve_log.csv /home/ec2-user/model/cve_log.csv
chmod +x cve_log.csv
cd model
chmod +x cve_log.csv
python3 predict.py system_architecture_sample.csv cve_log.csv 
rm predict.py 
nano predict.py
rm predict.py 
nano predict.py
python3 predict.py system_architecture_sample.csv cve_log.csv 
nano system_architecture_sample.csv 
nano cve_log.csv
rm cve_log.csv
exit
mv /home/ec2-user/cve_log.csv /home/ec2-user/model/cve_log.csv
cd model
chmod +x cve_log.csv
python3 predict.py system_architecture_sample.csv cve_log.csv 
cd model
ls
python3 predict.py system_architecture_log.csv cve_log.csv
nano predict.py 
python3 predict.py system_architecture_log.csv cve_log.csv
nano cve_log.csv
rm cve_log.csv
exit
mv /home/ec2-user/cve_log.csv /home/ec2-user/model/cve_log.csv
cd model/
chmod +x cve_log.csv
python3 predict.py system_architecture_log.csv cve_log.csv
nano system_architecture_log.csv 
nano cve_log.csv
nano predict.py 
python3 predict.py system_architecture_log.csv cve_log.csv
rm predict.py 
nano predict.py
python3 predict.py system_architecture_log.csv cve_log.csv
rm predict.py 
nano predict.py
python3 predict.py system_architecture_log.csv cve_log.csv
rm predict.py 
nano predict.py
python3 predict.py system_architecture_log.csv cve_log.csv
nano cve_log.csv 
rm cve_log.csv 
exit
mv /home/ec2-user/cve_log.csv /home/ec2-user/model/cve_log.csv
cd model
chmod +x cve_log.csv
python3 predict.py system_architecture_log.csv cve_log.csv
lear
clear
cd model
nano cve_log.csv
cd model 
nano cve_log.csv
exit
cd model
chmod 400 daiverp_rf_model_V2.pkl 
ls
mv daiverp_rf_model.pkl daiverp_rf_model_V1.pkl
ls
nano predict.py 
nano predict.pypy
ls
nano predict.py 
rm predict.py 
nano predict.py 
chmod 400 daiverp_rf_model_V2.pkl 
ls
python predict.py system_architecture_log.csv cve_log.csv daiverp_rf_model_v2.pkl
python3 predict.py system_architecture_log.csv cve_log.csv daiverp_rf_model_v2.pkl
chmod +x daiverp_rf_model_V2.pkl
python3 predict.py system_architecture_log.csv cve_log.csv daiverp_rf_model_V2.pkl
ython3 predict.py system_architecture_log.csv cve_log.csv daiverp_rf_model_V1.pkl
python3 predict.py system_architecture_log.csv cve_log.csv daiverp_rf_model_V1.pkl
python3 predict.py system_architecture_log.csv cve_log.csv daiverp_rf_model_V2.pkl
exit
ls
cd model
ls
cd
cd daiverp-project/
cd frontend/
cd src
cd components/
ls
nano Dashbaord.js
nano Dashboard.js
ls
nano CSVUploader.js
rm CSVUploader.js
nano CSVUploader.js
npm run build
cd
cd model
md5sum daiverp_rf_model_V1.pkl
md5sum daiverp_rf_model_V2.pkl
ls
nano inference.py
cd
ls
nano server.py
rm server.py
nano server.py
cd model
ls
nano server.py
cd
nano server.
nano server.py
cd model
nano predict.py 
cd
nano server.py
rm server.py
nano server.py
rm server.py
nano server.py
rm server.py
nano server.py
nano server.log 
sudo lsof -i :8080
netstat -tulnp | grep 8080
cd daiverp-project/
cd frontend/
cd src
cd components/
nano CSVUploader.js
cd
cd daiverp-project/
cd frontend/
cd src
cd components/
nano CSVUploader.js
npm run build
nano CSVUploader.js
cd
nano server.py
rm server.py
nano server.py
nano server.log
nano server.py
rm server.py
nano server.py
cd daiverp-project/
cd front
cd frontend/
cd src
cd components/
npm run build
cd daiverp-project/
cd frontend/
cd src
cd components/
nano CSVUploader.js
cd
nano server.py
rm server.py
nano server.py
cd daiverp-project/
cd frontend/
cd src
cd components/
nano CSVUploader.js
npm run build
nano CSVUploader.js
cd
nano server.py
python3 server.py
nano server.py
curl -v https://34.244.253.185:8080
nano server.py
python3 server.py
cd daiverp-project/
cd frontend/
cd src
cd components/
nano CSVUploader.js
npm run build
nano CSVUploader.js
npm run build
cd
nano server.log 
python3 server.py
nano server.py
cd daiverp-project/
cd frontend/
cd src
cd components/
nano Dashboard.js
npm run build
nano Dashboard.js
npm run build
cd
cd model
nano predict.py
cd
cd daiverp-project
cd frontend/
cd src
cd components/
nano Dashboard.js
npm run build
cd
cd model
nano predict.py 
rm predict.py 
nano predict.py 
cd
cd daiverp-project/
cd frontend/
cd src
cd components/
nano Dashboard.js
npm run build
nano Dashboard.js
npm run build
nano Dashboard.js
rm Dashboard.js
nano Dashboard.js
npm run build
nano Dashboard.js
exit
ls
mv DAIVERPLogo.png /home/ec2-user/daiverp-project/frontend/
cd daiverp-project/frontend/
ls
mv DAIVERPLogo.png /home/ec2-user/daiverp-project/frontend/src/components/
ls
cd src
cs components/
cd components/
ls
nano Dashboard.js
npm run build
nano Dashboard.js
npm run build
nano Dashboard.js
ls
nano Dashboard.js
npm run build
nano Dashboard.js
npm run build
nano Dashboard.js
cd
cd daiverp-project/
ls
cd frontend/
ls
cd src
cd components
mv DAIVERPLogo.png /home/ec2-user/daiverp-project/frontend/public
ls
cd
cd daiverp-project/frontend/public/
ls
cd
cd daiverp-project/frontend/src/components/
nano Dashboard.js
npm run build
cd daiverp-project/frontend/src/components/
nano Dashboard.js
rm Dashboard.js
nano Dashboard.js
npm run build
rm Dashboard.js
nano Dashboard.js
npm run build
nano Dashboard.js
nano Dashboard.css
npm run build
nano Dashboard.css
rm Dashboard.css
nano Dashboard.css
npm run build
nano Dashboard.js
npm run build
rm Dashboard.css
nano Dashboard.css
npm run build
rm Dashboard.css
nano Dashboard.css
npm run build
rm Dashboard.css
nano Dashboard.css
npm run build
nano Dashboard.css
npm run build
nano Dashboard.css
npm run build
nano Dashboard.css
npm run build
nano Dashboard.css
npm run build
cd daiverp-project/
npm install react-chartjs-2 chart.js
cd frontend/src/components/
nano SeverityBarChart.js
nano Dashboard.js
rm Dashboard.js
nano Dashboard.js
npm run build
cd daiverp-project/frontend/src/components/
yarn list --pattern "react-chartjs-2|chart.js"
npm install react-chartjs-2 chart.js
npm run build
cd
nano server.py
cd daiverp-project/frontend/src/components/
nano Dashboard.js
rm Dashboard.js
nano Dashboard.js
npm run build
rm Dashboard.js
nano Dashboard.js
npm run build
nano Dashboard.js
npm run build
cd
nano server.py
rm server.py
nano server.py
cd model 
nano predict.py 
rm predict.py 
nano predict.py 
cd
cd daiverp-project/frontend/src/components/
npm run build
ls
cd tools
ls
cd
cd uploads
ls
rm test.csv 
rm system_architecture_log.csv 
rm system_architecture_sample.csv 
rm cve_log.csv 
rm download.csv 
rm system_log.csv 
ls
cd
ls
cd daiverp-server/7
cd daiverp-server/
ls
ls server.js
nano server.js 
cd
nano server.py
rm server.py
nano server.py
