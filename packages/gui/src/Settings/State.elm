module Settings.State exposing
    ( init
    , update
    , subscriptions
    )

import Platform.Cmd

import Settings.Types exposing (..)
import Settings.Rest exposing
    ( getSettings
    )
import Error.State


init : (Model, Cmd Msg)
init =
    let
        settings =
            { blockchainPathList = []
            }
        (errorModel, errorCmd) = Error.State.init
    in
        (   { currentSettings = settings
            , savedSettings = settings
            , loading = True
            , saving = False
            , error = errorModel
            }
        , Cmd.batch
            [ Platform.Cmd.map ToError errorCmd
            , getSettings
            ]
        )


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        ToError subMsg ->
            let
                (subModel, subCmd) = Error.State.update subMsg model.error
            in
                ({model | error = subModel}, Platform.Cmd.map ToError subCmd)

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

        SetSettings settings ->
            ({ model
                | currentSettings = settings
                , savedSettings = settings
                , loading = False
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
