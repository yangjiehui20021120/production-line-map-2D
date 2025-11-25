# Digital Twin Production Map

A real-time digital twin visualization system for CRH380D sidewall production line.

## 🚀 Quick Start

```bash
# Extract project files
tar -xzf digital-twin-production-map.tar.gz

# Install dependencies
cd digital-twin-app
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📋 Features

- **Real-time Monitoring**: 10-second auto-refresh KPI dashboard
- **Multi-layer Visualization**: 11 interactive layers
- **Theme Views**: Flow, Quality, Efficiency, Planning, Spaghetti
- **Interactive Interface**: Station details, order tracking, equipment status
- **Main Flow Path**: 7 optimized production flow connections

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite 6
- **Styling**: Tailwind CSS 3
- **Visualization**: SVG + Custom Components
- **Data**: Real-time simulation with 10s refresh interval

## 📖 Documentation

See `本地部署运行说明.md` for detailed Chinese documentation including:
- Complete installation guide
- Configuration options
- Troubleshooting
- Project structure
- Maintenance instructions

## 🎯 Main Flow Path

The system displays 7 main production flow paths:
1. **Assembly → Repair** (Orange, 8 items)
2. **Repair → Assembly** (Green, 12 items)
3. **Assembly → Adjustment** (Yellow, 15 items)
4. **Adjustment → Grinding** (Cyan, 18 items)
5. **Grinding → Machining** (Purple, 22 items)
6. **Machining → Fine Grinding** (Red, 25 items)
7. **Fine Grinding → Accessories** (Green, 9 items)

## 🔧 Requirements

- Node.js 16.0+
- npm 7.0+
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## 📞 Support

For technical support, please check the Chinese documentation or verify:
- Node.js and npm versions
- Network connectivity
- Browser compatibility
- Firewall settings

---

**Version**: v1.0.0  
**Last Updated**: September 10, 2025

