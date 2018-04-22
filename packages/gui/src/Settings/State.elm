module Settings.State exposing
    ( init
    , update
    , subscriptions
    )

import Platform.Cmd

import Settings.Types exposing (..)
import Settings.Rest exposing
    ( loadSettings
    , saveSettings
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
            , loadSettings
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
                if model.loading || model.saving then
                    (model, Cmd.none)
                else
                    (changeSettings setSetting model, Cmd.none)

        Reset ->
            if model.loading || model.saving then
                (model, Cmd.none)
            else
                ({ model
                    | currentSettings = model.savedSettings
                }, Cmd.none)

        SetSettings settings ->
            if not model.loading || model.saving then
                (model, Cmd.none)
            else
                ({ model
                    | currentSettings = settings
                    , savedSettings = settings
                    , loading = False
                }, Cmd.none)

        Save ->
            if model.loading || model.saving then
                (model, Cmd.none)
            else
                (   { model
                        | saving = True
                    }
                , saveSettings model.currentSettings
                )

        SaveSuccess ->
            (   {model
                    | saving = False
                    , savedSettings = model.currentSettings
                }
            , Cmd.none)

        SaveFailure error ->
            update (ToError error) {model | saving = False}


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
