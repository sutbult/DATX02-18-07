module Settings.Rest exposing
    ( loadSettings
    , saveSettings
    )


import Json.Decode exposing
    ( Decoder
    , field
    , string
    , map
    , map2
    )
import Json.Encode exposing
    ( Value
    , object
    )

import Settings.Types exposing (..)
import Utils.Rest exposing
    ( get
    , post
    )


loadSettings : Cmd Msg
loadSettings =
    get
        "settings"
        decodeSettings
        SetSettings
        ToError


saveSettings : Settings -> Cmd Msg
saveSettings settings =
    post
        (encodeSettings settings)
        "settings"
        (Json.Decode.succeed ())
        (\_ -> SaveSuccess)
        SaveFailure


decodeSettings : Decoder Settings
decodeSettings =
    map Settings <|
        field "blockchainPathList" <|
            Json.Decode.list decodeBlockchainPath


encodeSettings : Settings -> Value
encodeSettings settings =
    object
        [   ( "blockchainPathList"
            , Json.Encode.list <|
                List.map encodeBlockchainPath settings.blockchainPathList
            )
        ]


decodeBlockchainPath : Decoder BlockchainPath
decodeBlockchainPath =
    map2 BlockchainPath
        (field "currency" string)
        (field "value" string)


encodeBlockchainPath : BlockchainPath -> Value
encodeBlockchainPath blockchainPath =
    object
        [ ("currency", Json.Encode.string blockchainPath.currency)
        , ("value", Json.Encode.string blockchainPath.value)
        ]
