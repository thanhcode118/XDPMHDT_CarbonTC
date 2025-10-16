# Terminal 1
cd C:\Users\LENOVO\Downloads\GIT\XDPMHDT_CarbonTC\CarbonTC.Auth.Service
docker-compose up -d mysql rabbitmq

# Terminal 2
cd C:\Users\LENOVO\Downloads\GIT\XDPMHDT_CarbonTC\CarbonTC.Auth.Service\src\CarbonTC.Auth.Api
dotnet run

# Terminal 3
cd C:\Users\LENOVO\Downloads\GIT\XDPMHDT_CarbonTC\carbontc.webclient
npm run dev

# Browser
http://localhost:3000
