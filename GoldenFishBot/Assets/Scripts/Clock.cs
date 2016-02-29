using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System;

public class Clock : MonoBehaviour {

	private Text clock;

	void Start () {
		clock = GetComponentInChildren<Text>();
	}
	
	// Update is called once per frame
	void Update () {
		DateTime time = System.DateTime.Now;
		clock.text = time.ToString("hh:mm");
		//Debug.Log(time.ToString("hh:mm"));
	}
}
