module Settings.Rest exposing
    ( getSettings
    )

import Json.Decode exposing (..)

import Settings.Types exposing (..)
import Utils.Rest exposing
    ( get
    )


getSettings : Cmd Msg
getSettings =
    get
        "settings"
        decodeSettings
        SetSettings
        ToError


decodeSettings : Decoder Settings
decodeSettings =
    map Settings <|
        field "blockchainPathList" <| list decodeBlockchainPath


decodeBlockchainPath : Decoder BlockchainPath
decodeBlockchainPath =
    map2 BlockchainPath
        (field "currency" string)
        (field "value" string)
