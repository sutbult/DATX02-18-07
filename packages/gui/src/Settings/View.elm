module Settings.View exposing
    ( root
    )

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)

import Settings.Types exposing (..)
import Bid.Types exposing
    ( currencyName
    )
import Error.View


root : Model -> Html Msg
root model =
    div []
        [ Html.map ToError <| Error.View.root model.error
        , div []
            [ h1 [class "subtitle"] [text "Blockchain paths"]
            , blockchainPathInputList model.currentSettings.blockchainPathList
            ]
        , buttonRow model
        ]


blockchainPathInputList
    :  List BlockchainPath
    -> Html Msg
blockchainPathInputList blockchainPathList =
    div []
        <| List.map blockchainPathInput blockchainPathList


blockchainPathInput
    :  BlockchainPath
    -> Html Msg
blockchainPathInput blockchainPath =
    div [class "field"]
        [ label [class "label"]
            [ text <| currencyName blockchainPath.currency
            ]
        , div [class "control"]
            [ input
                [ class <| "input"
                , type_ "text"
                , placeholder "default path"
                , value blockchainPath.value
                , onInput (SetBlockchainPath blockchainPath.currency)
                ] []
            ]
        ]


buttonRow : Model -> Html Msg
buttonRow model =
    let
        isDisabled =
            model.currentSettings == model.savedSettings
    in
        div
            [ style
                [ ("text-align", "right")
                , ("margin-top", "20px")
                ]
            ]
            [ button
                [ class <| "button is-medium"
                , onClick Reset
                , disabled isDisabled
                ]
                [ text "Reset"
                ]
            ]
