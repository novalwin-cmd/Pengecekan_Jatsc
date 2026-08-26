# 🌐 AirNav Network Access Guide

## **Quick Access**

### **From Any Device on AirNav Network:**

```
http://172.21.9.76:5174
```

---

## **Device Access Methods**

| Device | Frontend | Backend |
|--------|----------|---------|
| **Your Laptop (Localhost)** | http://localhost:5174 | http://localhost:3002 |
| **AirNav Network** | http://172.21.9.76:5174 | http://172.21.9.76:3002 |

---

## **For Staff / Team Members**

1. **Connect to AirNav network**
2. **Open browser**
3. **Go to:** `http://172.21.9.76:5174`
4. **Start using the system!** ✅

---

## **System Features**

✅ **Private Network Only** - Not accessible from internet  
✅ **Multi-User Access** - Multiple staff can use simultaneously  
✅ **Auto Google Sheets Sync** - All data syncs automatically  
✅ **4 Logsheet Types** - Beban Listrik, STS, UPS, MDS  
✅ **Real-time Monitoring** - Graphs and parameter tracking  

---

## **Starting the System**

```bash
cd /Users/clive/Documents/jatsc-inspection-system
npm run dev
```

Server will show:
- ✅ Database synced
- ✅ Backend running on port 3002
- ✅ Frontend running on port 5174
- ✅ Ready for network access

---

## **Troubleshooting**

### **Can't connect?**

1. ✅ Make sure device is on **AirNav network**
2. ✅ Check **server is running** (`npm run dev`)
3. ✅ Try **hard refresh** (Cmd+Shift+R / Ctrl+Shift+F5)
4. ✅ Use **IP address** (172.21.9.76), not hostname

---

## **Data Sync**

All readings automatically sync to Google Sheets:
- ✅ Beban Listrik Sheet
- ✅ STS Sheet  
- ✅ UPS Sheet
- ✅ MDS Sheet
- ✅ Master Report

No manual export needed! 📊

---

**Ready to use on AirNav network!** 🚀
