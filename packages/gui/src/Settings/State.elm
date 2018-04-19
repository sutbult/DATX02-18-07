module Settings.State exposing
    ( init
    , update
    , subscriptions
    )

import Settings.Types exposing (..)


init : (Model, Cmd Msg)
init =
    let
        settings =
            { blockchainPathList =
                [ BlockchainPath "BTC" ""
                , BlockchainPath "ETH" ""
                , BlockchainPath "ETC" ""
                ]
            }
    in
        (   { currentSettings = settings
            , savedSettings = settings
            }
        , Cmd.none
        )


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        SetBlockchainPath currency value ->
            let
                setSetting settings =
                    { settings
                        | blockchainPathList = setBlockchainPath
                            currency
                            value
                            settings.blockchainPathList
                    }
            in
                (changeSettings setSetting model, Cmd.none)

        Reset ->
            ({ model
                | currentSettings = model.savedSettings
            }, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none


changeSettings
    :  (Settings -> Settings)
    -> Model
    -> Model
changeSettings fn model =
    { model | currentSettings = fn model.currentSettings }


setBlockchainPath
    :  String
    -> String
    -> List BlockchainPath
    -> List BlockchainPath
setBlockchainPath currency value =
    List.map <| replaceBlockchainPath currency value


replaceBlockchainPath
    :  String
    -> String
    -> BlockchainPath
    -> BlockchainPath
replaceBlockchainPath currency value blockchainPath =
    if blockchainPath.currency == currency then
        BlockchainPath currency value
    else
        blockchainPath
