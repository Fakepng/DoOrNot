# DoOrNot

> ภาคเรียนที่ 1 ปีการศึกษา 2566

เป็นส่วนหนึ่งของโครงงาน วิชา 01236254 Circuit and Electronics และ วิชา 01236255 Introduction to Internet of Things

## รายชื่อสมาชิก

- 66010399 นายนพรุจ จิตถวิล
- 66010756 นายวริศวุธ จันทร์เชื้อ
- 66011314 นายกฤษณ์ เกษมเทวินทร์

## แนวคิดและที่มา

คณะวิศวกรรมศาสตร์สาขาระบบไอโอทีและสารสนเทศ ได้มีพื้นที่ส่วนหนึ่งเฉพาะสำหรับนักศึกษาและอาจารย์ในสาขานี้ โดยรวมไปถึงพื้นที่ทำงานส่วนกลาง หรือ Co-working space เฉพาะในสาขาที่กำลังปรับปรุงอยู่ ณ ปัจจุบัน ทางเราจึงได้มีแนวคิดที่จะทำโครงงาน DoOrNot โดยมีแนวคิดในที่จะพัฒนาความปลอดภัยและความเป็นส่วนตัวในระดับหนึ่ง ของห้อง Co-working ในสาขาของเรา จึงได้นำความรู้ทางด้าน IoT และ Circuit มาออกแบบประตูที่เฉพาะบุคคลในสาขาสามารถเข้ามาใช้งานได้โดยใช้บัตรนักศึกษาในการแสกนเข้า ห้อง Co-working ได้

## ภาพรวมโครงงาน

![image](/assets/Design.png)

## Block Diagram

![block diagram](/assets/BlockDiagram.png)

## ส่วนประกอบ

|                     รูป                      |     ส่วนประกอบ      |         รายละเอียด         |
| :------------------------------------------: | :-----------------: | :------------------------: |
| ![ESP8266DevKit](/assets/ESP8266DevKit.webp) |   ESP8266 DevKit    | บอร์ดควบคุมการทำงานของระบบ |
|     ![RFIDRC522](/assets/RFIDRC522.jpg)      | RFID Module (rc522) |     บอร์ดอ่านบัตร RFID     |
|   ![RELAYMODULE](/assets/RELAYMODULE.jpg)    |    Relay Module     |  บอร์ดรีเลย์ควบคุมกรประตู  |
| ![SOLENIOIDLOCK](/assets/SOLENOIDLOCK.webp)  |    Solenoid Lock    |          กรประตู           |
|        ![Buzzer](/assets/BUZZER.jpg)         |       Buzzer        |   บอร์ดส่งเสียงแจ้งเตือน   |
|    ![DCSTEPDOWN](/assets/DCSTEPDOWN.jpg)     |   DC-DC Step Down   |    บอร์ดแปลงกระแสไฟฟ้า     |
|   ![POWERSUPPLY](/assets/POWERSUPPLY.jpg)    |    Power Supply     |    บอร์ดแปลงกระแสไฟฟ้า     |
