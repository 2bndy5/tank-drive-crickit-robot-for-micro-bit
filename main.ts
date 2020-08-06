// parses 2 comma-separated numbers and returns an echo for confirmation.
function parseInput (input2: string) {
    temp = input2.split(",")
    turnstrength = parseFloat(temp[0])
    forwardbackward = parseFloat(temp[1])
    return "turning=" + temp[0] + "%, forward/backward=" + temp[1] + "%"
}
bluetooth.onBluetoothConnected(function () {
    basic.showString("connected")
    basic.showIcon(IconNames.Happy)
})
bluetooth.onBluetoothDisconnected(function () {
    basic.showString("disconnected")
    basic.showIcon(IconNames.No)
})
// Parse text input from serial connection over the Bluetooth radio.
// 
// Expected input format is "<turning-strength>,<forward-backward>".
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    bluetooth.uartWriteLine(parseInput(bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))))
})
// Parse text input from serial connection over the USB wire. This feature is meant for debugging before using Bluetooth
// 
// Expected input format is "<turning-strength>,<forward-backward>".
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    serial.writeLine("" + (parseInput(serial.readUntil(serial.delimiters(Delimiters.NewLine)))))
})
let forwardbackward = 0
let turnstrength = 0
let temp: string[] = []
crickit.tank(0, 0)
serial.redirectToUSB()
serial.setBaudRate(BaudRate.BaudRate9600)
bluetooth.startUartService()
basic.forever(function () {
    // If turning in place. Else going forward or backward while turning (AKA "veering")
    if (forwardbackward == 0) {
        // if turning in place clockwise (" > 0"). or counterclockwise (" < 0"). Else all motion stopped
        if (turnstrength != 0) {
            crickit.tank(turnstrength, -1 * turnstrength)
        } else {
            crickit.tank(0, 0)
        }
    } else {
        // If "veering" to the right. Else If "veering" to the left. Else just going forward or backward
        if (turnstrength > 0) {
            crickit.tank(forwardbackward, Math.round(forwardbackward * (1 - turnstrength / 100)))
        } else if (turnstrength < 0) {
            crickit.tank(Math.round(forwardbackward * (1 - turnstrength / 100)), forwardbackward)
        } else {
            crickit.tank(forwardbackward, forwardbackward)
        }
    }
})
